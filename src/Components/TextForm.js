import React, { useState, useEffect, useRef } from 'react';

export default function TextForm(props) {
    const [text, setText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [spokenWordIndex, setSpokenWordIndex] = useState(-1);
    const [msg, setMsg] = useState(null);
    const [isPaused, setIsPaused] = useState(false);

    const highlightedWordRef = useRef(null);

    useEffect(() => {
        const handleBeforeUnload = (event) => {
            if (isSpeaking) {
                window.speechSynthesis.cancel();
            }
            event.preventDefault();
            event.returnValue = '';
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            if (msg) {
                window.speechSynthesis.cancel();
            }
        };
    }, [isSpeaking, msg]);

    useEffect(() => {
        if (highlightedWordRef.current) {
            highlightedWordRef.current.scrollIntoView({
                behavior: 'smooth',
                block: 'center',
                inline: 'center',
            });
        }
    }, [spokenWordIndex]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.code === 'Space' && document.activeElement !== document.getElementById('myBox')) {
                event.preventDefault(); 
                if (isSpeaking) {
                    if (!isPaused) {
                        window.speechSynthesis.pause();
                        setIsPaused(true);
                        props.showAlert("Paused Speaking!", "success");
                    } else {
                        window.speechSynthesis.resume();
                        setIsPaused(false);
                        props.showAlert("Resumed Speaking!", "success");
                    }
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSpeaking, isPaused, props]);

    const handleTextFocus = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            setIsPaused(false);
        }
    };

    const handleUpClick = () => {
        if (text.trim() === '') {
            props.showAlert("Text is empty. Please enter some text.", "warning");
            return;
        }
        let newText = text.toUpperCase();
        setText(newText);
        props.showAlert("Converted to Uppercase!", "success");
    }

    const handleloClick = () => {
        if (text.trim() === '') {
            props.showAlert("Text is empty. Please enter some text.", "warning");
            return;
        }
        let newText = text.toLowerCase();
        setText(newText);
        props.showAlert("Converted to Lowercase!", "success");
    }

    const handletiClick = () => {
        if (text.trim() === '') {
            props.showAlert("Text is empty. Please enter some text.", "warning");
            return;
        }
        let newText = text.toLowerCase().split(' ').map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1);
        }).join(' ');
        setText(newText);
        props.showAlert("Converted to Titlecase!", "success");
    }

    const handlesenClick = () => {
        if (text.trim() === '') {
            props.showAlert("Text is empty. Please enter some text.", "warning");
            return;
        }
        let newText = text.trim();
        newText = newText.toLowerCase(); 
        newText = newText.charAt(0).toUpperCase() + newText.slice(1); 
        setText(newText);
        props.showAlert("Converted to Sentence Case!", "success");
    }

    const handleextraspaces = () => {
        if (text.trim() === '') {
            props.showAlert("Text is empty. Please enter some text.", "warning");
            return;
        }
        let newText = text.split(/\s+/);
        setText(newText.join(" "));
        props.showAlert("Extra Spaces Removed!", "success");
    }

    const handlecopy = () => {
        if (text.trim() === '') {
            props.showAlert("Text is empty. Please enter some text.", "warning");
            return;
        }
        var textToCopy = document.getElementById('myBox');
        textToCopy.select();
        navigator.clipboard.writeText(textToCopy.value);
        document.getSelection().removeAllRanges();
        props.showAlert("Copied to Clipboard!", "success");
    }

    const handleDownload = () => {
        if (text.trim() === '') {
            props.showAlert("Cannot download file. Text is empty!", "danger");
            return;
        }
        const element = document.createElement("a");
        const file = new Blob([text], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "myTextFile.txt";
        document.body.appendChild(element);
        element.click();
        props.showAlert("File Downloaded!", "success");
    }

    const handleclrClick = () => {
        if (text.trim() === '') {
            props.showAlert("Text is already empty!", "info");
            return;
        }
        let newText = '';
        setText(newText);
        props.showAlert("Text Cleared!", "success");
    }

    const speak = () => {
        if (text.trim() === '') {
            props.showAlert("Text is empty. Please enter some text.", "warning");
            return;
        }
        setIsSpeaking(true);
        let newMsg = new SpeechSynthesisUtterance();
        newMsg.text = text;
        let currentIndex = 0;
        newMsg.onboundary = (event) => {
            if (event.name === 'word') {
                setSpokenWordIndex(currentIndex);
                currentIndex++;
            }
        };
        newMsg.onend = () => {
            setIsSpeaking(false);
            setSpokenWordIndex(-1);
            setMsg(null);
        };
        window.speechSynthesis.speak(newMsg);
        setMsg(newMsg);
        props.showAlert("Speaking!", "success");
    };

    const stop = () => {
        if (text.trim() === '') {
            props.showAlert("No text to stop speaking!", "warning");
            return;
        }
        if (!isPaused) {
            window.speechSynthesis.pause();
            setIsPaused(true);
        } else {
            window.speechSynthesis.resume();
            setIsPaused(false);
        }
        props.showAlert(isPaused ? "Resumed Speaking!" : "Paused Speaking!", "success");
    };

    const wordCount = (text) => {
        let regex = /\s+\S+/;
        let numOfWords = text.split(regex);
        return numOfWords.length;
    };

    const handleOnChange = (event) => {
        setText(event.target.value);
    };

    return (
        <>
            <div className='container my-3' style={{ color: props.mode === 'dark' ? 'white' : '#042743' }}>
                <h1 className='container text-center my-4'>{props.heading}</h1>
                <div className="mb-3 container text-center">
                    <textarea
                        className="form-control"
                        value={text}
                        onChange={handleOnChange}
                        onFocus={handleTextFocus} 
                        id="myBox"
                        style={{
                            backgroundColor: props.mode === 'dark' ? 'rgb(33 37 41)' : 'white',
                            color: props.mode === 'dark' ? 'white' : 'black'
                        }}
                        rows="10"
                    ></textarea>
                    <button className="btn btn-primary btn-m my-4 mx-1" onClick={handleUpClick}>Convert to Uppercase</button>
                    <button className="btn btn-primary btn-m my-4 mx-1" onClick={handleloClick}>Convert to Lowercase</button>
                    <button className="btn btn-primary btn-m my-4 mx-1" onClick={handletiClick}>Convert to Titlecase</button>
                    <button className="btn btn-primary btn-m my-4 mx-1" onClick={handlesenClick}>Convert to Sentence Case</button>
                    <button className="btn btn-primary btn-m my-4 mx-1" onClick={handleextraspaces}>Remove Extra Spaces</button>
                    <button className="btn btn-primary btn-m my-4 mx-1" onClick={handlecopy}>Copy Text</button>
                    <button className="btn btn-primary btn-m my-4 mx-1" onClick={speak}><i className="bi bi-volume-up"></i></button>
                    <button className="btn btn-primary btn-m my-4 mx-1" onClick={stop}>
                        {isPaused ? <i className="bi bi-play"></i> : <i className="bi bi-pause"></i>}
                    </button>
                    <button className="btn btn-primary btn-m my-4 mx-1" onClick={handleDownload}>Download File</button>
                    <button className="btn btn-danger btn-m my-4 mx-1" onClick={handleclrClick}>Clear</button>
                </div>
            </div>
            <div className="container my-3" style={{ color: props.mode === 'dark' ? 'white' : '#042743' }}>
                <h2 className='container text-center'>Your Text Summary</h2>
                <p className='container text-center'>{text === "" ? 0 : wordCount(text)} words and {text.length} characters</p>
                <p className='text-center'>{0.008 * text.split(/\s+/).filter((element) => { return element.length !== 0 }).length} Minutes to Read</p>
                <h2 className='container text-center'>Preview</h2>
                <p className='container text-center'>
                    {text.split(/\s+/).map((word, index) => (
                        <span ref={index === spokenWordIndex ? highlightedWordRef : null} key={index} style={{ backgroundColor: isSpeaking && index === spokenWordIndex ? 'yellow' : 'transparent', color: isSpeaking && index === spokenWordIndex && props.mode === 'dark' ? 'black' : 'inherit', fontSize: text.trim() ? '30px' : 'inherit' }}>
                            {word}{' '}
                        </span>
                    ))}
                </p>
            </div>
        </>
    );
}