"use client";

import { useEffect, useState } from "react";
import styles from "./candidato.css";

export default function CandidatoDashboard() {
    return(
        <>     
            <main>       
                <aside className="barra-lateral">
                    <button>Dashboard</button>
                    <button>Meu currículo</button>
                    <button>Minhas candidaturas</button>
                    <button>Favoritos e histórico</button>
                </aside>
                <div>
                    <h1>Olá, Usuário</h1>
                    <div className="info">
                        <article className="card-info">
                            <p>Candidaturas ativas</p>
                            <h1>2</h1>
                        </article>
                        <article className="card-info">
                            <p>Entrevistas marcadas</p>
                            <h1>1</h1>
                        </article>
                        <article className="card-info">
                            <p>Vagas Favoritas</p>
                            <h1>10</h1>
                        </article>
                        <article className="card-info">
                            <p>Currículo preenchido</p>
                            <h1>67%</h1>
                        </article>
                    </div>
                    
                </div>
            </main>
        </>
    )
}