import { Col, Container, Row, Table } from "react-bootstrap";

// Figures transcribed directly from the club's 18-hole scorecard image (corrected
// version - supersedes an earlier 9-hole image that turned out to be the wrong
// data). Cross-checked before use: White-tee Out/In/Total (1114 / 1268 / 2382),
// Men par Out/In/Total (27 / 27 / 54) and Ladies par (27 / 27 / 54) all match the
// per-hole rows summed below. Yellow/Blue/Red tees have no yardage published yet -
// those columns are genuinely "-" on the club's own card, not missing data.
interface HoleRow {
  hole: number;
  menPar: number;
  menSI: number;
  white: number;
  ladiesPar: number;
  ladiesSI: number;
}

const FRONT_NINE: HoleRow[] = [
  { hole: 1, menPar: 3, menSI: 3, white: 155, ladiesPar: 3, ladiesSI: 3 },
  { hole: 2, menPar: 3, menSI: 17, white: 93, ladiesPar: 3, ladiesSI: 17 },
  { hole: 3, menPar: 3, menSI: 5, white: 105, ladiesPar: 3, ladiesSI: 5 },
  { hole: 4, menPar: 3, menSI: 15, white: 100, ladiesPar: 3, ladiesSI: 15 },
  { hole: 5, menPar: 3, menSI: 13, white: 95, ladiesPar: 3, ladiesSI: 13 },
  { hole: 6, menPar: 3, menSI: 11, white: 126, ladiesPar: 3, ladiesSI: 11 },
  { hole: 7, menPar: 3, menSI: 7, white: 145, ladiesPar: 3, ladiesSI: 7 },
  { hole: 8, menPar: 3, menSI: 9, white: 115, ladiesPar: 3, ladiesSI: 9 },
  { hole: 9, menPar: 3, menSI: 1, white: 180, ladiesPar: 3, ladiesSI: 1 },
];

const BACK_NINE: HoleRow[] = [
  { hole: 10, menPar: 3, menSI: 2, white: 158, ladiesPar: 3, ladiesSI: 2 },
  { hole: 11, menPar: 3, menSI: 18, white: 97, ladiesPar: 3, ladiesSI: 18 },
  { hole: 12, menPar: 3, menSI: 8, white: 102, ladiesPar: 3, ladiesSI: 8 },
  { hole: 13, menPar: 3, menSI: 6, white: 152, ladiesPar: 3, ladiesSI: 6 },
  { hole: 14, menPar: 3, menSI: 10, white: 155, ladiesPar: 3, ladiesSI: 10 },
  { hole: 15, menPar: 3, menSI: 16, white: 142, ladiesPar: 3, ladiesSI: 16 },
  { hole: 16, menPar: 3, menSI: 14, white: 150, ladiesPar: 3, ladiesSI: 14 },
  { hole: 17, menPar: 3, menSI: 12, white: 170, ladiesPar: 3, ladiesSI: 12 },
  { hole: 18, menPar: 3, menSI: 4, white: 142, ladiesPar: 3, ladiesSI: 4 },
];

const OUT = { menPar: 27, white: 1114, ladiesPar: 27 };
const IN = { menPar: 27, white: 1268, ladiesPar: 27 };
const TOTAL = { menPar: 54, white: 2382, ladiesPar: 54 };

function HoleRows({ rows }: { rows: HoleRow[] }) {
  return (
    <>
      {rows.map((h) => (
        <tr key={h.hole}>
          <td className="fw-semibold">{h.hole}</td>
          <td>{h.menPar}</td>
          <td>{h.menSI}</td>
          <td className="tee-white">{h.white}</td>
          <td className="tee-yellow">-</td>
          <td className="tee-blue">-</td>
          <td className="tee-red">-</td>
          <td>{h.ladiesPar}</td>
          <td>{h.ladiesSI}</td>
        </tr>
      ))}
    </>
  );
}

function SubtotalRow({ label, values }: { label: string; values: typeof OUT }) {
  return (
    <tr className="bg-secondary-subtle fw-semibold">
      <td>{label}</td>
      <td>{values.menPar}</td>
      <td></td>
      <td className="tee-white">{values.white}</td>
      <td className="tee-yellow">0</td>
      <td className="tee-blue">0</td>
      <td className="tee-red">0</td>
      <td>{values.ladiesPar}</td>
      <td></td>
    </tr>
  );
}

function RatingRow({ label }: { label: string }) {
  return (
    <tr>
      <td colSpan={3} className="text-end text-muted">
        {label}
      </td>
      <td className="tee-white">-</td>
      <td className="tee-yellow">-</td>
      <td className="tee-blue">-</td>
      <td className="tee-red">-</td>
      <td colSpan={2}></td>
    </tr>
  );
}

export function CourseScorecard() {
  return (
    <section className="mt-5">
      <Container>
        <Row className="mb-3">
          <Col xs={6} sm={4}>
            <div className="text-uppercase text-muted small">Course Type</div>
            <div className="fw-semibold">Golf</div>
          </Col>
          <Col xs={6} sm={4}>
            <div className="text-uppercase text-muted small">Measurement</div>
            <div className="fw-semibold">Yards</div>
          </Col>
        </Row>

        <Table bordered responsive className="text-center align-middle scorecard-table mb-0">
          <thead>
            <tr>
              <th className="bg-dark"></th>
              <th colSpan={2} className="bg-dark text-white">
                Men
              </th>
              <th colSpan={4} className="bg-dark text-white">
                Tees
              </th>
              <th colSpan={2} className="bg-dark text-white">
                Ladies
              </th>
            </tr>
            <tr className="bg-dark text-white">
              <th>Hole</th>
              <th>Par</th>
              <th>SI</th>
              <th className="tee-white">White</th>
              <th className="tee-yellow">Yellow</th>
              <th className="tee-blue">Blue</th>
              <th className="tee-red">Red</th>
              <th>Par</th>
              <th>SI</th>
            </tr>
          </thead>
          <tbody>
            <HoleRows rows={FRONT_NINE} />
            <SubtotalRow label="Out" values={OUT} />
            <HoleRows rows={BACK_NINE} />
            <SubtotalRow label="In" values={IN} />
            <tr className="bg-dark text-white fw-semibold">
              <td>Total</td>
              <td>{TOTAL.menPar}</td>
              <td></td>
              <td className="tee-white">{TOTAL.white}</td>
              <td className="tee-yellow">0</td>
              <td className="tee-blue">0</td>
              <td className="tee-red">0</td>
              <td>{TOTAL.ladiesPar}</td>
              <td></td>
            </tr>

            <tr>
              <td colSpan={9} className="text-primary fw-semibold text-start ps-3 border-0">
                Men CR/Slope
              </td>
            </tr>
            <RatingRow label="front 9" />
            <RatingRow label="back 9" />

            <tr>
              <td colSpan={9} className="text-primary fw-semibold text-start ps-3 border-0">
                Women CR/Slope
              </td>
            </tr>
            <RatingRow label="front 9" />
            <RatingRow label="back 9" />
          </tbody>
        </Table>
      </Container>
    </section>
  );
}
