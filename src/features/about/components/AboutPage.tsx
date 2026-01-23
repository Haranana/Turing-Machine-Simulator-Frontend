import { getInitialTheme, THEME_KEY, type Theme } from '@app/providers/ThemeProvider'
import { useEffect, useState } from 'react'
import { GithubLogo } from '@shared/ui/icons/GithubLogo'
import { MailIcon } from '@primer/octicons-react'
import '@features/about/styles/About.css'
import { useLocation } from 'react-router-dom'

export default function AboutPage(){
    const [theme] = useState<Theme>(() => getInitialTheme())

    useEffect(() => {        
        document.documentElement.dataset.theme = theme;
        window.localStorage.setItem(THEME_KEY, theme);
    }, [theme])

     const { hash } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = hash.slice(1);
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [hash]);

    return(
        <main className='About'>
                <section className='AboutSegment'>
                  <div className='SegmentFirstColumn'>
                    <h2 className='SegmentTitle'>What's this page about?</h2>
                    <p className='SegmentDescription'>This website lets you create and simulate Turing machines. It's intended as an educational tool for students learning computability, automata, and formal language theory.</p>
                    <p className='SegmentDescription'>It supports multi-tape and nondeterministic machines, offers customizable program syntax, and provides a (hopefully) convenient way to save and share your work.</p>
                    
                  </div>
                  <div className="SegmentSecondColumn">                       
                    
                  </div>
                </section>
                <hr className='LineSeparator'></hr>
                <section className='AboutSegment'>
                  <div className='SegmentFirstColumn'>
                      <h2 className='SegmentTitle'>What is a Turing machine?</h2>
                      <p className='SegmentDescription'>A Turing machine is a simple abstract model of computation used to define what it means for a problem to be “computable”. It consists of:</p>
                        <ul>  
                        <li><p className='SegmentDescription'>an (unbounded) tape divided into cells that acts as memory,</p></li>
                        <li><p className='SegmentDescription'>a head that reads and writes symbols on the tape and moves left or right,</p></li>
                        <li><p className='SegmentDescription'>a set of transition rules (the program) that tells the machine what to do based on its current state and the symbol it reads.</p></li>
                        </ul>
                    <p className='SegmentDescription'>Even though it's minimal, a Turing machine can represent any algorithm that a real computer can run (given enough time and tape).</p>
                    </div>
                    <div className="SegmentSecondColumn"> 
                      
                    </div>
                </section>
                <hr className='LineSeparator'></hr>
                <section className='AboutSegment'>
                    <div className='SegmentFirstColumn'>
                      <h2 className='SegmentTitle'>How do I create a Turing machine?</h2>                                  
                      <ul>
                        <li><p className='SegmentDescription'>Open the Settings tab to customize the program syntax and special state names.</p></li>
                        <li><p className='SegmentDescription'>Go to the Console and define the transition function by writing transition instructions.</p></li>
                        <li><p className='SegmentDescription'>Open the Simulation panel, add input to the tape (using the arrow under the tape), and click Load simulation.</p></li>
                      </ul>
                      <p className='SegmentDescription'>If everything loads without errors, use controls like Play, Pause, and Jump to step through the execution.</p>
                    <p className='SegmentDescription'>Keep in mind that each simulation may be only 1000 steps long due to server limitations. If created machine computation is longer than that it will be cut with proper "LIMIT" output.</p>
                    </div>
                    <div className="SegmentSecondColumn">
                     
                    </div>
                </section>
                <hr className='LineSeparator'></hr>
                <section className='AboutSegment'>
                    <div className='SegmentFirstColumn'>
                      <h2 className='SegmentTitle'>How do I simulate a nondeterministic Turing machine?</h2>
                      <p className='SegmentDescription'>First, enable Allow nondeterministic machines in Settings. Then, in your program, add two or more transitions with the same left-hand side (same state and read symbol[s]) but different right-hand sides. Each such choice creates a branch in the nondeterministic computation tree.
                      </p>
                      <p className='SegmentDescription'>After loading the simulation, open the Tree page from the sidebar. You'll see a tree of possible execution paths. Click a node and choose which transition to follow at that branch.</p>
                    </div>
                    <div className="SegmentSecondColumn">                     
                    </div>
                </section>
                <hr className='LineSeparator'></hr>
                <section className='AboutSegment'>
                    <div className='SegmentFirstColumn'>
                      <h2 className='SegmentTitle'>How do I save created machines?</h2>
                      <p className='SegmentDescription'>To save machines, you need an account. Create one in the Account page (available from the sidebar), then sign in. In your user panel, choose Create from the navigation bar.</p>
                      <p className='SegmentDescription'>After you provide a name and description, the machine will be saved to your account using the current program and configuration. You can view and load saved machines in the Manage tab on the Account page.</p>
                    </div>
                    <div className="SegmentSecondColumn">                     
                    </div>
                </section>
                <hr className='LineSeparator'></hr>
                <section className='AboutSegment' id="privacySection">
                    <div className='SegmentFirstColumn'>
                    <h2 className='SegmentTitle'>Privacy</h2>
                    <p className='SegmentDescription'>This website stores the email address of registered users and a password hash for authentication. It may also send emails to confirm actions such as account activation, password resets, or account deletion.                    
                    </p>
                    <p className='SegmentDescription'>
                        This data is stored in the database and is not shared with third parties. You can delete your account at any time. Doing so permanently removes your account data from the service.                        
                    </p>
                    </div>
                    <div className="SegmentSecondColumn">                     
                    </div>
                </section>      
                <hr className='LineSeparator'></hr>              
                <section className='AboutSegment'>
                    <div className='SegmentFirstColumn'>
                      <div className='SegmentFirstColumnRow'>
                        <div className='RowIconDiv'></div>
                        <div className='RowTextDiv'><h2 className='SegmentTitle'>Contact</h2></div>
                      </div>
                      <div className='SegmentFirstColumnRow'>
                        <div className='RowIconDiv'>
                            <div className='SubsegmentIcon'>
                                <a href="https://github.com/Haranana/Turing-Machine-Simulator-Frontend" target="_blank" rel="noopener noreferrer"><GithubLogo size={75}/></a>
                            </div>
                        </div>
                        <div className='RowTextDiv'>
                            <div className='SegmentDescription'>                   
                                <p>To suggest improvements, report a bug, or view the source code, click the GitHub icon on the left.</p>             

                            </div>   
                        </div>
                      </div>
                      <div className='SegmentFirstColumnRow'>
                        <div className='RowIconDiv'>
                            <div className='SubsegmentIcon'>
                                <MailIcon size={75}></MailIcon>
                            </div>
                        </div>
                        <div className='RowTextDiv'>
                            <div className='SegmentDescription'>
                                                                <p>For anything else, feel free to email me at:</p>
                                <a href="mailto:turingmachinesimulator@gmail.com">
                                    turingmachinesimulator@gmail.com
                                </a>
                            </div>
                        </div>
                      </div>
                    </div>
                    <div className="SegmentSecondColumn">                     
                    </div>
                </section>                                                 
        </main>  
    )
}









