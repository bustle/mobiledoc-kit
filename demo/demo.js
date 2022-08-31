import { Editor, UI } from './mobiledoc.js'

function bootstrapSimpleDemo() {
  const el = document.querySelector('#editor-basic')
  const editor = new Editor({
    placeholder: 'Welcome to Mobiledoc',
  })
  editor.render(el)
}

function activateButtons(parentSelector, editor) {
  document.querySelectorAll(`${parentSelector} button`).forEach(button =>
    button.addEventListener('click', () => {
      const action = button.getAttribute('data-action')
      const args = button.getAttribute('data-args').split(',')
      const payload = (function () {
        try {
          return JSON.parse(button.getAttribute('data-payload'))
        } catch {}
      })()
      args[0] === 'a' ? UI[action](editor) : editor[action](...args, payload)
    })
  )
}

function bootstrapEditor() {
  const el = document.querySelector('#editor')
  const editor = new Editor({
    placeholder: 'Type here',
    autofocus: true,
  })
  editor.render(el)
  activateButtons('#editor-wrapper', editor)
  const displayMobiledoc = () => {
    const mobiledoc = editor.serialize()
    // eslint-disable-next-line no-undef
    const html = mobiledocPrettyJSONRenderer(mobiledoc)
    document.querySelector('#editor-output').innerHTML = html
  }
  editor.postDidChange(displayMobiledoc)
  displayMobiledoc()
}

const bootstrapToolbarEditor = () => {
  const el = document.querySelector('#editor-toolbar')
  const editor = new Editor({
    placeholder: 'Editor with toolbar',
  })
  editor.render(el)

  activateButtons('#editor-toolbar-wrapper', editor)
}

const bootstrapCardEditor = () => {
  const card = {
    name: 'kitten',
    type: 'dom',
    render({ env, opts, payload }) {
      const el = document.createElement('div')
      const img = document.createElement('img')
      const caption = document.createElement('figcaption')
      const button = document.createElement('button')
      img.src = 'https://placekitten.com/200/100'
      caption.innerText = payload.caption
      button.innerText = 'Edit'
      button.addEventListener('click', () => env.edit())
      el.appendChild(img)
      el.appendChild(caption)
      el.appendChild(button)
      return el
    },
    edit({ env, opts, payload }) {
      const el = document.createElement('div')
      const img = document.createElement('img')
      const button = document.createElement('button')
      const input = document.createElement('input')
      img.src = 'https://placekitten.com/200/100'
      input.value = payload.caption
      input.autofocus = true
      button.innerText = 'Save'
      button.addEventListener('click', () => {
        env.save({ caption: input.value })
      })
      el.appendChild(img)
      el.appendChild(input)
      el.appendChild(button)
      return el
    },
  }
  const atom = {
    name: 'click-counter',
    type: 'dom',
    render({ env, value, payload }) {
      let clicks = payload.clicks || 0
      const button = document.createElement('button')
      button.appendChild(document.createTextNode('Clicks: ' + clicks))
      button.onclick = () => {
        payload.clicks = clicks + 1
        env.save(value, payload)
      }
      return button
    },
  }
  const el = document.querySelector('#editor-card')
  const editor = new Editor({
    placeholder: 'Editor with card',
    cards: [card],
    atoms: [atom],
  })
  editor.render(el)
  activateButtons('#editor-card-wrapper', editor)
}

document.addEventListener('DOMContentLoaded', () => {
  bootstrapEditor()
  bootstrapSimpleDemo()
  bootstrapToolbarEditor()
  bootstrapCardEditor()
})
