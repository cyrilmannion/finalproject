import { CourseScorecard } from "../components/CourseScorecard";

export function TheCourse() {
  return (
    <>
      <section>
        <h1>The Course</h1>
        <p className="lead">
          Stepaside's nine-hole layout, tees and yardage, taken directly from the club's own
          scorecard.
        </p>
      </section>

      <CourseScorecard />
    </>
  );
}
