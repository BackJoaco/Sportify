import { useNavigate } from "react-router-dom";
import "./NotFound.css";

export default function NotFound() {
    const navigate = useNavigate();

    return (
        <div className="notfound-container">
            <div className="notfound-card">
                <h1 className="notfound-code">404</h1>
                <h2 className="notfound-title">Página no encontrada</h2>
                <p className="notfound-message">
                    Lo sentimos, la página que buscas no existe.
                </p>
                
                <div className="notfound-actions">
                    <button 
                        className="btn-home"
                        onClick={() => navigate("/perfil")}
                    >
                        Ir al inicio
                    </button>
                    <button 
                        className="btn-back"
                        onClick={() => navigate(-1)}
                    >
                        Volver atrás
                    </button>
                </div>
            </div>
        </div>
    );
}
