import { useEffect, useState } from "react";
import { getInitialTheme, THEME_KEY, type Theme } from '@app/providers/ThemeProvider';
import codeExampleDark from 'src/assets/codeSnippet2_dark.png'
import codeExampleLight from 'src/assets/codeSnippet2_light.png'
import tapesImageLight from 'src/assets/tapesLightTransparent.png'
import tapesImageDark from 'src/assets/tapesDarkTransparent.png'

import "@features/home/styles/Home.css"
import { SaveLoadShareIcon } from "@shared/ui/icons/SaveLoadShare";
  

export default function HomePage() {
  const [theme] = useState<Theme>(() => getInitialTheme());

    useEffect(() => {        
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem(THEME_KEY, theme);
    }, [theme]);

   return(
        <main className='home'>
          <h1>Turing machine simulator</h1>
            <nav className='HomeNav'>
              <div className='SegmentOnlyColumn'>
                <a className="linkButton" href="/app/simulation">Open simulator</a>              
                <a className="linkButton" href="/app/about">Learn more</a>
            
              </div>
            </nav>
                <section className='HomeSegment'>
                  <div className='SegmentFirstColumn'>
                      <h2 className='SegmentTitle'>Nondeterministic and multitape machines</h2>
                      <p className='SegmentDescription'>Make your machines with up to 8 tapes and nondeterministic. Choose which branch of machine calculation tree to follow.</p>
                  </div>
                  <div className="SegmentSecondColumn">                       
                    {theme == "light"? <img className="TapesImage SecondColumnImage" src={tapesImageLight} alt="Image of machine tapes tapesImage" /> : <img className="TapesImage SecondColumnImage" src={tapesImageDark} alt="Image of machine tapes" /> }
                  </div>
                </section>
                <hr className='LineSeparator'></hr>
                <section className='HomeSegment'>
                  <div className='SegmentFirstColumn'>
                      <h2 className='SegmentTitle'>Save, load and share your machines</h2>
                      <p className='SegmentDescription'>Register an account to be able to save your machines and load them any time you want. Share them by generating 5 characters share codes.</p>
                    </div>
                    <div className="SegmentSecondColumn"> 
                       {<SaveLoadShareIcon className="SaveLoadShareIcon"></SaveLoadShareIcon>}
                    </div>
                </section>
                <hr className='LineSeparator'></hr>
                <section className='HomeSegment'>
                    <div className='SegmentFirstColumn'>
                      <h2 className='SegmentTitle'>Customize program syntax</h2>
                      <p className='SegmentDescription'>Choose whatever naming convention you are used to for your transition instructions and special states. </p>
                    </div>
                    <div className="SegmentSecondColumn">
                      {theme == "light"? <img className="CodeExampleImage SecondColumnImage" src={codeExampleLight} alt="Code Example" /> : <img className="CodeExampleImage SecondColumnImage" src={codeExampleDark} alt="Code Example" /> }
                    </div>
                </section>                              
        </main>  
    );
}