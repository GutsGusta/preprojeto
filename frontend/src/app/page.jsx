import Link from "next/link";
import "./page.css";
import VagasRecentes from "./_components/VagasRecentes";
export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  return (
    <>
      <main className="inicio">
        <div className="texto">
          <h1>Encontre a vaga certa para você</h1>
          <p>Busque entre vagas de empresas cadastradas e acompanhe cada etapa da sua candidatura.</p>
          <form className="pesquisa" action="/vagas">
            <div className="pesquisa-campo">
              <label htmlFor="pesquisa-cargo">Cargo ou palavra-chave</label>
              <input id="pesquisa-cargo" type="text" name="q" placeholder="Ex.: desenvolvedor front-end" />
            </div>
            <div className="pesquisa-campo">
              <label htmlFor="pesquisa-cidade">Cidade</label>
              <input id="pesquisa-cidade" type="text" name="cidade" placeholder="Ex.: Santo André" />
            </div>
            <button type="submit" className="btn-pesquisar">Buscar vagas</button>
          </form>
        </div>  
        <div className="inicio-conteudo">
          <div className="inicio-vagas">
            <div className="txt-vagas">
              <h3>Vagas recentes</h3>
              <Link className="btn-vagas" href="/vagas">Ver todas</Link> 
            </div>
            <VagasRecentes />
          </div>

          <div className="sou-algo">
            <article className="card-sou">
              <h3>Sou candidato</h3>
              <p>Monte seu currículo, candidate-se e acompanhe o processo.</p>
              <Link href="/cadastro" className="cadastrar">Criar conta grátis</Link>
            </article>

            <article className="card-sou">
              <h3>Sou empresa</h3>
              <p>Publique vagas e organize as etapas de seleção em um só lugar.</p>
              <Link href="/cadastro?tipo=empresa" className="entrar">Anunciar vagas</Link>
            </article>
          </div>
          
        </div>
      </main>
      
    </>
  );
}
