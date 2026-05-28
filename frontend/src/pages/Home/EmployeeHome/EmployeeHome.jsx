import { FaMoneyBillWave } from "react-icons/fa";
import "./EmployeeHome.css";

export default function EmployeeHome() {
  return (
    <main className="employee-home-container">
      <section className="employee-home-header">
        <div>
          <span>Panel de empleado</span>
          <h1>Registrar seña presencial</h1>
          <p>Desde aca vas a poder registrar pagos presenciales de reservas.</p>
        </div>
      </section>

      <section className="employee-action-panel">
        <div className="employee-action-icon">
          <FaMoneyBillWave />
        </div>
        <div>
          <h2>Registrar seña presencial</h2>
          <p>Esta accion quedara conectada al flujo de pagos presenciales.</p>
        </div>
      </section>
    </main>
  );
}
