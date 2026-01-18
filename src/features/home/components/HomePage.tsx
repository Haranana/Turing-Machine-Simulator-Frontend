import { useEffect, useState } from "react";
import { getInitialTheme, THEME_KEY, type Theme } from '@app/providers/ThemeProvider';
import "@features/home/styles/Home.css"
  

export default function HomePage() {
  const [theme] = useState<Theme>(() => getInitialTheme());

    useEffect(() => {
        
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

    function onDontShowThisAgainClicked(){
      //todo
    }

    /*
  return (
    <div className="home">
      <h1>TuringSim</h1>
      <p>lorem ipsum</p>
      <a className="primaryButton" href="/app/simulation">Open simulator</a>
    </div>
  );*/

   return(
        <main className='home'>
          <h1>Turing machine simulator</h1>
            <section className='HomeSegment'>
              <div className='SegmentOnlyColumn'>
                <a className="linkButton" href="/app/simulation">Open simulator</a>              
                <a className="linkButton" href="/app/about">Learn more</a>
                <a className="primaryButton" onClick={onDontShowThisAgainClicked} href="/app/simulation">Open simulator and never show this page again</a>
              </div>
            </section>
                <section className='HomeSegment'>
                  <div className='SegmentFirstColumn'>
                      <h2 className='SegmentTitle'>Special States</h2>
                      <p className='SegmentDescription'>Set how would you want to refer to initial, accept and reject states inside code.</p>
                  </div>
                  <div className="SegmentSecondColumn">                       

                  </div>
                </section>
                <hr className='LineSeparator'></hr>
                <section className='HomeSegment'>
                  <div className='SegmentFirstColumn'>
                      <h2 className='SegmentTitle'>Special States</h2>
                      <p className='SegmentDescription'>Set how would you want to refer to initial, accept and reject states inside code.</p>
                    </div>
                    <div className="SegmentSecondColumn"> 
                       
                    </div>
                </section>
                <hr className='LineSeparator'></hr>
                <section className='HomeSegment'>
                    <div className='SegmentFirstColumn'>
                      <h2 className='SegmentTitle'>Special States</h2>
                      <p className='SegmentDescription'>Set how would you want to refer to initial, accept and reject states inside code.</p>
                    </div>
                    <div className="SegmentSecondColumn">

                    </div>
                </section>                              
        </main>  
    );
}