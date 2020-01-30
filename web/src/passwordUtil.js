function formatPasswordUrl(senderName, password, messageId) {
    const origin = new URL(window.location.href).origin;
    return `${origin}?mode=password&id=${messageId}#${password}`;
}

function parsePassword(s) {
    const re = / ?([a-f0-9]{32})\n?/;
    const match = s.match(re);
    if (match && match[1]) {
        return match[1];
    }
    console.warn("Failed to parse password, returning original value");
    return s;
}

export { formatPasswordUrl, parsePassword };
