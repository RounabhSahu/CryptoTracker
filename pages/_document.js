import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
    render() {
        return (
            <Html lang="en">
                <Head>
                    <link href="https://fonts.googleapis.com/css2?family=Monoton&display=swap" rel="stylesheet"/>
                </Head>
                <body className='h-full bg-black tex'>
                <Main />
                <NextScript />
                </body>
            </Html>
        );
    }
}

export default MyDocument;