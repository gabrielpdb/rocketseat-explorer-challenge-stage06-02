import { GithubUser } from './GithubUser.js'

export class Favorites {
  constructor(root) {
    this.root = document.querySelector(root)
    this.load()
  }

  load() {
    this.entries = JSON.parse(localStorage.getItem('@github-favorites:')) || []
  }

  save() {
    localStorage.setItem('@github-favorites:', JSON.stringify(this.entries))
  }

  async add(username) {
    try {
      const userExists = this.entries.find(entry => entry.login === username)

      if (userExists) {
        throw new Error('Usuário já favoritado')
      }

      const user = await GithubUser.search(username)

      if (user.login === undefined) {
        throw new Error('Usuário não encontrado')
      }

      this.entries = [user, ...this.entries]
      this.update()
      this.save()
    } catch (error) {
      alert(error.message)
    }
  }

  delete(user) {
    this.entries = this.entries.filter(entry => entry.login !== user.login)

    this.update()
    this.save()
  }
}

export class FavoritesView extends Favorites {
  constructor(root) {
    super(root)

    this.tbody = this.root.querySelector('table tbody')

    this.update()
    this.onAdd()
  }

  onAdd() {
    const addButton = this.root.querySelector('.search button')
    addButton.onclick = () => {
      const { value } = this.root.querySelector('.search input')

      this.add(value)
    }
  }

  update() {
    this.removeAllTr()

    if (this.entries.length === 0) {
      console.log('aqui')
      this.tbody.style.height = '68.8rem'
      document.querySelector('.empty').classList.add('active')
    } else {
      this.tbody.style.height = 0
      document.querySelector('.empty').classList.remove('active')
    }

    this.entries.forEach(user => {
      const row = this.createRow()

      row.querySelector(
        '.user img'
      ).src = `https://github.com/${user.login}.png`
      row.querySelector('.user img').alt = `Imagem de ${user.name}`
      row.querySelector('a').href = `https://github.com/${user.login}`
      row.querySelector('a p').textContent = `${user.name}`
      row.querySelector('a span').textContent = `/${user.login}`
      row.querySelector('.repositories').textContent = `${user.public_repos}`
      row.querySelector('.followers').textContent = `${user.followers}`
      row.querySelector('.remove').onclick = () => {
        const isOk = confirm('Tem certeza que deseja deletar este favorito?')

        if (isOk) {
          this.delete(user)
        }
      }

      this.tbody.append(row)
    })
  }

  createRow() {
    const tr = document.createElement('tr')

    tr.innerHTML = `
    <tr>
      <td class="user">
        <img/>
        <a target="_blank">
          <p>Gabriel Pontel Dal Bó</p>
          <span>/gabrielpdb</span>
        </a>
      </td>
      <td class="repositories">50</td>
      <td class="followers">0</td>
      <td><button class="remove">Remover</button></td>
    </tr>
    `

    return tr
  }

  removeAllTr() {
    this.tbody.querySelectorAll('tr').forEach(tr => {
      tr.remove()
    })
  }
}
