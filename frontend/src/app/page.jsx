import Link from "next/link";
import "./page.css";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

  return (
    <>
      <div className="cabecalho">
        <h3>JobMatch</h3>
        <div className="cabecalho-btn">
          <Link href="">Vagas</Link>
          <Link href="">Empresas</Link>
          <Link href="">Para empresas</Link>
        </div>
        <div className="btn-login">
          <Link href="./login" className="entrar">Entrar</Link>
          <Link href="" className="cadastrar">Cadastrar</Link>
        </div>
      </div>
      <main>
        <div className="texto">
          <h1>Encontre a vaga certa para você</h1>
          <p>Busque entre vagas de empresas cadastradas e acompanhe cada etapa da sua candidatura.</p>
          {/* <div></div> aqui fica uma pesquisa */}
        </div>  
        <div className="pagina">
          <div className="">
            <div className="txt-vagas">
              <h3>Vagas recentes</h3>
              <Link className="btn-vagas " href="">Ver todas</Link> 
            </div>
            <div className="vagas">
              <article className="card-vaga">
              <div className="txt-detalhe">
                <img src="/icon-exemplo.png"/>
                <div className="txt-nome">
                  <h3>Título vaga</h3>
                  <p>Empresa</p>
                </div>
              </div>
              {/* <p>Tags com cidade, tipo de emprego e tipo de vaga</p> */}
              <p>Descrição</p>
            </article>
            <article className="card-vaga">
              <div className="txt-detalhe">
                <img src="/icon-exemplo.png"/>
                <div className="txt-nome">
                  <h3>Título vaga</h3>
                  <p>Empresa</p>
                </div>
              </div>
              {/* <p>Tags com cidade, tipo de emprego e tipo de vaga</p> */}
              <p>Descrição</p>
            </article>
            <article className="card-vaga">
              <div className="txt-detalhe">
                <img src="/icon-exemplo.png"/>
                <div className="txt-nome">
                  <h3>Título vaga</h3>
                  <p>Empresa</p>
                </div>
              </div>
              {/* <p>Tags com cidade, tipo de emprego e tipo de vaga</p> */}
              <p>Descrição</p>
            </article>
            </div>
            
          </div>

          <div className="sou-algo">
            <article className="card-sou">
              <h3>Sou candidato</h3>
              <p>Monte seu currículo, candidate-se e acompanhe o processo.</p>
              <Link href="./login" className="cadastrar">Criar conta grátis</Link>
            </article>

            <article className="card-sou">
              <h3>Sou empresa</h3>
              <p>Publique vagas e organize as etapas de seleção em um só lugar.</p>
              <Link href="./login" className="entrar">Anunciar vagas</Link>
            </article>
          </div>
          
        </div>
      </main>
      
    </>
  );
}
