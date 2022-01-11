const state = {
  cards: {
    1: 'A',
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: 'J',
    12: 'Q',
    13: 'K',
  },
  symbols: [
    ['♤', 'black'],
    ['♡', 'red'],
    ['◇', 'red'],
    ['♧', 'black'],
  ],
  passTxt: 'Pasas',
  passIcon: '🤞',
  players: null,
  currentPlayerIndex: 0,
  challengeTxt: '',
  challengeIcon: '',
  rounds: 0,
}

const currentPlayer = document.querySelector('[data-current-player]')
const cardValue = document.querySelector('[data-card-value]')
const cardSymbol = document.querySelector('[data-card-symbol]')
const first = document.querySelector('[data-first]')
const firstSymbol = document.querySelector('[data-first-symbol]')
const second = document.querySelector('[data-second]')
const secondSymbol = document.querySelector('[data-second-symbol]')
const challenge = document.querySelector('[data-challenge]')
const challengeIcon = document.querySelector('[data-challenge-icon]')
const initGameForm = document.querySelector('[data-init-game]')
const dealButton = document.querySelector('[data-deal]')
const reloadPage = document.querySelector('[data-reload-page]')

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1) + min)
}

function withDealer() {
  let card1 = false,
    card2 = false,
    last = false,
    end = false
  count = 0

  const state = { card1, card2, last, end }

  return () => {
    count++

    if (count === 1) {
      state.card1 = true
      return state
    }

    if (count === 2) {
      state.card2 = true
      return state
    }

    if (count === 3) {
      state.last = true
      return state
    }

    state.end = true
    const lastState = { ...state }

    state.card1 = false
    state.card2 = false
    state.last = false
    state.end = false

    count = 0

    return lastState
  }
}

function resetInnerTextAndColor(...elems) {
  elems.forEach((elem) => {
    elem.innerText = '?'
    elem.style.color = 'darkgreen'
  })
}

function setInnerTextWithColor(...elems) {
  elems.forEach(([elem, txt, color]) => {
    elem.innerText = txt
    if (color) {
      elem.style.color = color
    }
  })
}

function arrayNextIndex(arr = [], currentIndex = 0) {
  let lastIndex = arr.length - 1
  return lastIndex && currentIndex < lastIndex ? currentIndex + 1 : 0
}

initGameForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const [activityInput, iconsSelect, playersInput] = Array.from(
    e.target.elements
  ).filter(({ nodeName }) => nodeName === 'INPUT' || nodeName === 'SELECT')

  state.challengeTxt = activityInput.value
  state.challengeIcon = iconsSelect.value
  state.players = playersInput.value.split(',').map((player) => player.trim())
  state.rounds = state.players.length || 0

  initGameForm.classList.add('hidden')
  initGameForm.reset()
  currentPlayer.innerText = state.players[state.currentPlayerIndex]
})

const deal = withDealer()
let intigers = []

const resetAllElems = () => {
  resetInnerTextAndColor(
    first,
    firstSymbol,
    second,
    secondSymbol,
    challenge,
    challengeIcon,
    cardValue,
    cardSymbol,
    currentPlayer
  )
}

dealButton.addEventListener('click', () => {
  const randomInt = getRandomIntInclusive(1, 13)
  const [symbol, color] =
    state.symbols[Math.floor(Math.random() * state.symbols.length)]
  const randomCardValue = state.cards[randomInt]
  setInnerTextWithColor(
    [cardValue, randomCardValue, color],
    [cardSymbol, symbol, color]
  )

  const { card1, card2, last, end } = deal()

  if (card1 && !card2 && !last && !end) {
    setInnerTextWithColor(
      [first, randomCardValue, color],
      [firstSymbol, symbol, color]
    )
    intigers.push(randomInt)
  }

  if (card1 && card2 && !last && !end) {
    setInnerTextWithColor(
      [second, randomCardValue, color],
      [secondSymbol, symbol, color]
    )
    intigers.push(randomInt)
  }

  if (card1 && card2 && last && !end) {
    const [a, b] = intigers.sort((a, b) => a - b)
    if (randomInt > a && randomInt < b) {
      setInnerTextWithColor(
        [challenge, state.passTxt, 'darkgreen'],
        [challengeIcon, state.passIcon]
      )
    } else {
      setInnerTextWithColor(
        [challenge, state.challengeTxt, 'darkorange', true],
        [challengeIcon, state.challengeIcon]
      )
    }
    intigers = []
    dealButton.innerText = 'Siguiente'
  }

  if (end) {
    resetAllElems()
    state.currentPlayerIndex = arrayNextIndex(
      state.players,
      state.currentPlayerIndex
    )
    currentPlayer.innerText = state.players[state.currentPlayerIndex]
    dealButton.innerText = 'Carta'
  }
})

reloadPage.addEventListener('click', () => {
  state.players = null
  state.currentPlayerIndex = 0
  state.challengeTxt = ''
  state.challengeIcon = ''
  state.rounds = 0
  resetAllElems()
  initGameForm.classList.remove('hidden')
})
