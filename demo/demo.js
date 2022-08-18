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
      args[0] === 'a' ? UI[action](editor) : editor[action](...args)
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
    render() {
      const el = document.createElement('figure')
      el.innerHTML = `
        <img src="http://placekitten.com/200/100">
        <figcaption>Image of a kitten</figcaption>
      `
      return el
    },
  }
  const atom = {
    name: 'mention',
    type: 'dom',
    render() {
      const el = document.createElement('span')
      el.setAttribute('style', 'background-color: #CCC;')
      el.innerText = `@hello`
      return el
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
