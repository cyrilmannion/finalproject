# Deploying to AWS EC2

Single-instance deployment: one EC2 box runs Nginx (port 80, public) which serves the
built React app as static files and reverse-proxies `/api` to the Node/Express server
(running on `localhost:4000`, not exposed publicly). SQLite stays as the database for
now - see "Future work" at the bottom for the Postgres/RDS swap the README originally
planned.

No domain yet, so this deploys over plain HTTP to the EC2's public IP. That means
traffic (including login passwords and JWTs) is unencrypted - fine for a coursework
demo, but call it out explicitly as a known limitation in Chapter 5 (Testing/Evaluation)
alongside the security-header discussion already in the interim report. Adding a domain
+ HTTPS later is a small follow-up (see bottom).

## Before you start

- Your EC2 instance's **public IP address** (or Elastic IP, if you've allocated one -
  recommended so the address doesn't change on reboot).
- Your **SSH key pair** (`.pem` file) for that instance.
- Your EC2's **security group** allows inbound:
  - Port 22 (SSH) - ideally restricted to your own IP, not `0.0.0.0/0`.
  - Port 80 (HTTP) - open to `0.0.0.0/0` so the site is publicly reachable.
  - Port 4000 does **not** need to be open publicly - Nginx will talk to it over
    `localhost` only. Leave it closed/unlisted in the security group.
- Your VPC's subnet for this instance needs a route to an Internet Gateway (it must,
  since you can already SSH into it from outside).

## Step 1 - Connect and identify the OS

```
ssh -i /path/to/your-key.pem ec2-user@<EC2_PUBLIC_IP>
```

If `ec2-user` doesn't work, try `ubuntu` (Ubuntu AMIs use that username instead). Once
connected, check which OS you're on:

```
cat /etc/os-release
```

- If it says `Amazon Linux` → use the **`dnf`** commands below.
- If it says `Ubuntu` → use the **`apt`** commands below.

## Step 2 - Install Node.js 22

The server uses `node:sqlite` (Node's built-in SQLite module), which needs **Node 22
or newer** - the default package-manager version is usually too old, so install it via
NodeSource explicitly.

**Ubuntu:**
```
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Amazon Linux:**
```
curl -fsSL https://rpm.nodesource.com/setup_22.x | sudo bash -
sudo dnf install -y nodejs
```

Verify:
```
node --version    # should print v22.x
```

## Step 3 - Install Nginx and git

**Ubuntu:**
```
sudo apt-get install -y nginx git
```

**Amazon Linux:**
```
sudo dnf install -y nginx git
```

Start Nginx now and make sure it survives a reboot:
```
sudo systemctl enable --now nginx
```

## Step 4 - Get the code onto the server

**If your code is pushed to GitHub (recommended):**
```
git clone <your-repo-url> stepaside
cd stepaside
```

**If it isn't in a remote repo**, upload it from your own machine instead (run this on
your Windows machine, not the EC2 box - PowerShell with OpenSSH works fine):
```
scp -i C:\path\to\your-key.pem -r "C:\Users\mypc\Desktop\Cyril Lecture Notes\Project\StepasideWebApp" ec2-user@<EC2_PUBLIC_IP>:~/stepaside
```
Exclude `node_modules` first (it's large and will be rebuilt on the server anyway) -
either add a `.gitignore`-respecting sync tool or just delete local `node_modules`
folders in a copy before `scp`.

## Step 5 - Install dependencies and build

From the project root on the EC2 instance:
```
cd ~/stepaside
npm install
npm run build:client
npm run build:server
```
This produces `client/dist/` (static site) and `server/dist/` (compiled JS).

## Step 6 - Production `.env`

```
cp server/.env.example server/.env
nano server/.env
```

Set:
```
PORT=4000
SQLITE_DB_PATH=./data/stepaside.db
JWT_SECRET=<generate a new one - see below>
JWT_EXPIRES_IN=8h
CLIENT_ORIGIN=http://<EC2_PUBLIC_IP>
```

Generate a fresh `JWT_SECRET` for production rather than reusing your local dev one:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 7 - Change the seeded admin password

`server/src/db/seed.ts` seeds `admin@stepaside.local` / `Admin123!` automatically on
first run if the database is empty. That credential is written in your README and is
now effectively public (it'll be in your final report's appendix too) - **do not leave
it active on a publicly reachable server.** After the first boot seeds the database,
log in as that admin and either change the password (if the app has that flow yet) or
update the row directly:

```
cd ~/stepaside/server
node -e "
const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const db = new DatabaseSync('./data/stepaside.db');
const newHash = bcrypt.hashSync('<pick-a-real-password>', 10);
db.prepare('UPDATE users SET password_hash = ? WHERE email = ?').run(newHash, 'admin@stepaside.local');
console.log('Admin password updated.');
"
```

## Step 8 - Run the server with pm2

A plain `node dist/index.js` dies when your SSH session ends. Use `pm2` to keep it
running and restart it on crash/reboot:

```
sudo npm install -g pm2
cd ~/stepaside/server
pm2 start dist/index.js --name stepaside-api
pm2 save
pm2 startup    # run the command it prints, to survive an instance reboot
```

Useful commands: `pm2 status`, `pm2 logs stepaside-api`, `pm2 restart stepaside-api`.

## Step 9 - Configure Nginx

Create `/etc/nginx/conf.d/stepaside.conf` (Amazon Linux) or
`/etc/nginx/sites-available/stepaside` + symlink into `sites-enabled` (Ubuntu):

```nginx
server {
    listen 80;
    server_name _;

    root /home/ec2-user/stepaside/client/dist;
    index index.html;

    # API calls go to the Node process - same path prefix the Vite dev proxy used,
    # so no client code changes are needed between dev and prod.
    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # SPA fallback: any non-file, non-/api route (e.g. /booking, /about-us on a
    # hard refresh) should still serve index.html so react-router can handle it
    # client-side, instead of Nginx 404ing.
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

Adjust the `root` path if you used a different clone directory or a non-`ec2-user`
username (`whoami` to check). Then reload Nginx:

```
sudo nginx -t   # validates the config
sudo systemctl reload nginx
```

## Step 10 - Test

From your own machine's browser: `http://<EC2_PUBLIC_IP>/` - the homepage, hero video,
weather widget, tee-time booking (once logged in), and admin login should all work
exactly as they do locally. Check `pm2 logs stepaside-api` if `/api/*` calls fail, and
`sudo journalctl -u nginx` / `sudo tail -f /var/log/nginx/error.log` if the static site
itself doesn't load.

## Redeploying after a code change

```
cd ~/stepaside
git pull                 # or re-upload via scp
npm install               # only needed if package.json changed
npm run build:client
npm run build:server
pm2 restart stepaside-api
```
No Nginx change needed unless you edited the Nginx config itself.

## Future work (worth a line in Chapter 6 - Future Work)

- **HTTPS + a real domain**: point a domain's A record at the EC2's (Elastic) IP, then
  `sudo apt/dnf install certbot python3-certbot-nginx` and
  `sudo certbot --nginx -d yourdomain.com` for a free, auto-renewing certificate.
- **Postgres via RDS**: the README already documents which two files
  (`server/src/db/index.ts` and the `?`-placeholder queries in `server/src/routes/*.ts`)
  would need to change - schema was kept dialect-neutral specifically to make this a
  contained swap later.
- **Elastic IP**: if you haven't already, allocate one and associate it with the
  instance so the public IP doesn't change if the instance restarts.
