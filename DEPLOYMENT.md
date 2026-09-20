# Deploying to AWS EC2

Single-instance deployment. One Ubuntu EC2 instance runs Nginx, which terminates HTTPS, serves the built
React app as static files and reverse-proxies `/api` to the Node/Express server on `localhost:4000` (not
exposed publicly). SQLite is the database. The site is served over HTTPS at a free DuckDNS subdomain with
a Let's Encrypt certificate and a set of security headers.

Placeholders used below: `<ELASTIC_IP>` (the instance's Elastic IP), `<HOSTNAME>` (your DuckDNS
subdomain, e.g. `example.duckdns.org`), `<KEY_FILE>` (your EC2 key pair `.pem`, kept outside the repo).

## 1. Launch the instance

In the EC2 console:

1. **AMI:** Ubuntu Server 24.04 LTS. **Type:** `t3.micro`. **Storage:** default 8 GiB gp3.
2. **Key pair:** create one and store the `.pem` **outside this repository**. It is a private key and must
   never be committed.
3. **Network:** a public subnet with auto-assign public IP enabled.
4. **Security group** (new, dedicated to this instance), inbound:
   - 22 (SSH) - your own IP only, not `0.0.0.0/0`
   - 80 (HTTP) - `0.0.0.0/0` (needed for the HTTPS redirect and certificate issue/renewal)
   - 443 (HTTPS) - `0.0.0.0/0`
   - Nothing else. Port 4000 is only reached by Nginx over localhost.
5. **Elastic IP:** allocate one and associate it with the instance, so the address survives a stop/start.
   Note that associating it releases the old auto-assigned public IP.

Connect with `ssh -i <KEY_FILE> ubuntu@<ELASTIC_IP>`.

## 2. Hostname

Create a free subdomain at duckdns.org and set its IP to `<ELASTIC_IP>`. Confirm with
`nslookup <HOSTNAME>`. Let's Encrypt cannot issue certificates for a bare IP, so a hostname is required.

## 3. Install Node.js 22, Nginx and git

The server uses `node:sqlite`, which needs Node 22 or newer, so install it from NodeSource:

```
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs nginx git
sudo systemctl enable --now nginx
node --version    # v22.x
```

## 4. Get the code, install and build

```
git clone <your-repo-url> stepaside
cd stepaside
npm install
npm run build:client
npm run build:server
```

## 5. Production configuration

```
cp server/.env.example server/.env
nano server/.env
```

```
PORT=4000
SQLITE_DB_PATH=./data/stepaside.db
JWT_SECRET=<generated - see below>
JWT_EXPIRES_IN=8h
CLIENT_ORIGIN=https://<HOSTNAME>
```

Generate a fresh production secret rather than reusing the development one:

```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 6. Run the API with pm2

```
sudo npm install -g pm2
cd ~/stepaside/server
pm2 start dist/index.js --name stepaside-api
pm2 save
pm2 startup    # run the command it prints so the API restarts after a reboot
```

## 7. Replace the seeded Admin password

On first start the server seeds a default Admin account (see `server/src/db/seed.ts`) whose credentials
are known. **Replace its password before exposing the site.** The password is read from a prompt so it is
not stored in shell history:

```
cd ~/stepaside/server
read -s -p "New admin password: " NEWPW; echo
NEWPW="$NEWPW" node -e "
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const db = new DatabaseSync('./data/stepaside.db');
const hash = bcrypt.hashSync(process.env.NEWPW, 10);
const r = db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(hash, '<admin-email>');
console.log('Rows updated:', r.changes);
"
unset NEWPW
```

`<admin-email>` is the seeded Admin email. Use a long unique password and keep it in a password manager.
The app has no change-password screen yet, so this manual reset is a known limitation.

## 8. Nginx

Nginx's worker runs as `www-data` and cannot read another user's home directory, so the built client is
copied to `/var/www/` instead of being served from `~/stepaside/client/dist`. This also keeps the web root
separate from `server/.env` and its `JWT_SECRET`.

```
sudo mkdir -p /var/www/stepaside
sudo cp -r ~/stepaside/client/dist/* /var/www/stepaside/
sudo chown -R www-data:www-data /var/www/stepaside
```

Create `/etc/nginx/sites-available/stepaside` (start with the port 80 block only; certbot adds the
HTTPS parts in step 9):

```nginx
server {
    listen 80;
    server_name <HOSTNAME>;

    root /var/www/stepaside;
    index index.html;

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback so react-router routes survive a hard refresh.
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Enable it and remove Ubuntu's default site:

```
sudo ln -s /etc/nginx/sites-available/stepaside /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t && sudo systemctl reload nginx
```

Check `http://<HOSTNAME>` loads before continuing.

## 9. HTTPS with certbot

```
sudo apt-get install -y certbot python3-certbot-nginx
sudo certbot --nginx -d <HOSTNAME>
sudo certbot renew --dry-run    # confirms automatic renewal works
```

Choose the redirect option when prompted. Certbot adds the `listen 443 ssl` configuration and certificate
paths to the site file.

## 10. Security headers and compression

In the HTTPS (`listen 443 ssl`) server block, add:

```nginx
add_header X-Frame-Options "DENY" always;
add_header X-Content-Type-Options "nosniff" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy-Report-Only "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; media-src 'self'; connect-src 'self'; frame-ancestors 'none'" always;
add_header Strict-Transport-Security "max-age=31536000" always;

gzip on;
gzip_types text/css application/javascript application/json image/svg+xml;
```

Notes:

- `always` sends the headers on error responses too. Nginx does not inherit `add_header` into a `location`
  that defines its own, so keep them at server level.
- The CSP starts in report-only mode. Load the site with the browser console open, add any legitimate
  origins it reports (for example a weather API in `connect-src`), then rename the header to
  `Content-Security-Policy` to enforce it.
- HSTS omits `includeSubDomains` and `preload` because the parent domain is not owned by this project.
- Keep each `add_header` on a single line. A line break inside the quoted CSP value breaks the config.

```
sudo nginx -t && sudo systemctl reload nginx
```

## 11. Verify

```
curl -I http://<HOSTNAME>     # expect 301 to https
curl -I https://<HOSTNAME>    # expect 200 and the five security headers
```

Then use the site in a browser: homepage, weather widget, login, booking. If `/api/*` calls fail, check
`pm2 logs stepaside-api` and that `CLIENT_ORIGIN` matches the HTTPS hostname. For static-file problems,
check `sudo tail -f /var/log/nginx/error.log`.

## Redeploying after a code change

```
cd ~/stepaside
git pull
npm install                  # only if package.json changed
npm run build:client
npm run build:server
sudo cp -r client/dist/* /var/www/stepaside/
pm2 restart stepaside-api
```

## Known limitations and future work

- **Database:** SQLite on the instance disk is a single point of failure with no automated backups.
  Moving to Postgres on RDS is contained to `server/src/db/index.ts` and the `?`-placeholder queries in
  `server/src/routes/*.ts`.
- **Security headers:** the CSP is report-only until the console is clean.
- **Hostname:** a free DuckDNS subdomain rules out HSTS preload; a registered domain would allow it.
- **Admin password:** reset by hand (step 7); a change-password flow would remove that step.
- **Server-side enforcement:** `POST /api/bookings` should require authentication on the API, not only in
  the UI.
- **Operations:** deployment is manual; there is no monitoring or automated backup.
