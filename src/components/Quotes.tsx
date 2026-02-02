import { useState, useEffect } from 'react';
const Quotes = () => {
    const [quote, setQuote] = useState('');
    const [author, setAuthor] = useState('');

    useEffect(() => {
        getQuote();
    }, []);

    const getQuote = () => {
        const url = `https://gist.githubusercontent.com/romatroskin/6d32e7ec0ca0cd44670f0de771072a5a/raw/dcb7753294b228a344ad784e11cc12e18a07178d/quotes.json`;
        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                const dataQuotes = data.quotes;
                const randomNum = Math.floor(Math.random() * dataQuotes.length);
                const randomQuote = dataQuotes[randomNum];

                setQuote(randomQuote.text);
                setAuthor(randomQuote.author);
            });
    };

    return (
        <div>
            <blockquote>
                <p>
                    <span id="quote-text">{quote}</span>
                </p>
                <cite>
                    <p>
                        <span id="quote-author">{author}</span>
                    </p>
                </cite>
            </blockquote>
        </div>
    );
};

export default Quotes;
