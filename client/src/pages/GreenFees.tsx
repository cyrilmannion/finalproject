import { GreenFeesRates } from "../components/GreenFeesRates";

export function GreenFees() {
  return (
    <>
      <section>
        <h1>Green Fees</h1>
        <p className="lead">
          Current visitor rates at Stepaside, with online booking for both visitors and
          societies.
        </p>
      </section>

      <GreenFeesRates />
    </>
  );
}
