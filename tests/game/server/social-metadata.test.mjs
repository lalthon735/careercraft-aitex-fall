import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'

const gameRoot = new URL('../../../src/game/', import.meta.url)
const html = fs.readFileSync(new URL('sources/index.html', gameRoot), 'utf8')
const head = html.split('</head>')[0]

test('public metadata identifies CareerCraft, not the original portfolio', () => {
    assert.match(head, /<title>CareerCraft<\/title>/)
    for(const field of ['og:title', 'og:site_name', 'twitter:title'])
        assert.ok(head.includes(`="${field}" content="CareerCraft"`))
    assert.doesNotMatch(head, /bruno|creative portfolio|Three\.js Journey|careersphere|kerjayaku/i)
    assert.ok(head.includes('property="og:url" content="https://careercraft.example.com/"'))
})

test('share previews use a local CareerCraft PNG with declared dimensions', () => {
    const image = 'https://careercraft.example.com/social/careercraft-share.png'
    for(const field of ['og:image', 'twitter:image', 'image'])
        assert.ok(head.includes(`="${field}" content="${image}"`))
    const png = fs.readFileSync(new URL('static/social/careercraft-share.png', gameRoot))
    assert.equal(png.subarray(0, 8).toString('hex'), '89504e470d0a1a0a')
    assert.equal(png.readUInt32BE(16), 1200)
    assert.equal(png.readUInt32BE(20), 630)
})

test('installed app name matches CareerCraft while source attribution is retained', () => {
    const manifest = JSON.parse(fs.readFileSync(new URL('static/favicons/site.webmanifest', gameRoot), 'utf8'))
    assert.equal(manifest.name, 'CareerCraft')
    assert.equal(manifest.short_name, 'CareerCraft')
    assert.match(head, /name="apple-mobile-web-app-title" content="CareerCraft"/)
    assert.match(html, /foundation is adapted from Bruno Simon/)
})

test('homepage and all translated introductions use the project name', () => {
    assert.doesNotMatch(html, /careersphere|kerjayaku/i)
    const translations = fs.readFileSync(new URL('sources/Career/i18n.js', gameRoot), 'utf8')
    assert.doesNotMatch(translations, /careersphere|kerjayaku/i)
    assert.match(html, /<h1[^>]*>CareerCraft<\/h1>/)
})
