const globalState = {
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
  players: [],
  currentPlayerIndex: 0,
  challengeTxt: '',
  challengeIcon: '',
  rounds: 0,
  cardValues: [],
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
    end = false,
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

    const prevState = { ...state }

    state.card1 = false
    state.card2 = false
    state.last = false
    state.end = false

    count = 0

    return prevState
  }
}

function resetInnerTextAndColor(...elems) {
  elems.forEach((elem) => {
    elem.innerText = '?'
    elem.style.color = 'darkgreen'
  })
}

function setInnerTextAndColorOptional(...elems) {
  elems.forEach(([elem, txt, color]) => {
    elem.innerText = txt
    if (color) {
      elem.style.color = color
    }
  })
}

function getNextArrayIndex(arr = [], currentIndex = 0) {
  let lastIndex = arr.length - 1
  return lastIndex && currentIndex < lastIndex ? currentIndex + 1 : 0
}

function resetAllElems() {
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

initGameForm.addEventListener('submit', (e) => {
  e.preventDefault()

  const { challengeTxt, challengeIcon, players } = Object.fromEntries(
    new FormData(e.target).entries()
  )

  if (!challengeTxt || !challengeIcon || !players) return

  globalState.challengeTxt = challengeTxt
  globalState.challengeIcon = challengeIcon
  globalState.players = players
    .split(',')
    .map((player) => player.trim())
    .filter(Boolean)
  globalState.rounds = globalState.players.length || 0

  initGameForm.classList.add('hidden')
  initGameForm.reset()
  currentPlayer.innerText = globalState.players[globalState.currentPlayerIndex]
})

const deal = withDealer()

dealButton.addEventListener('click', () => {
  const randomInt = getRandomIntInclusive(1, 13)
  const [symbol, color] =
    globalState.symbols[Math.floor(Math.random() * globalState.symbols.length)]
  const randomCardValue = globalState.cards[randomInt]
  setInnerTextAndColorOptional(
    [cardValue, randomCardValue, color],
    [cardSymbol, symbol, color]
  )

  const { card1, card2, last, end } = deal()

  if (card1 && !card2 && !last && !end) {
    setInnerTextAndColorOptional(
      [first, randomCardValue, color],
      [firstSymbol, symbol, color]
    )
    globalState.cardValues.push(randomInt)
  }

  if (card1 && card2 && !last && !end) {
    setInnerTextAndColorOptional(
      [second, randomCardValue, color],
      [secondSymbol, symbol, color]
    )
    globalState.cardValues.push(randomInt)
  }

  if (card1 && card2 && last && !end) {
    const [low, high] = globalState.cardValues.sort((a, b) => a - b)
    if (randomInt > low && randomInt < high) {
      setInnerTextAndColorOptional(
        [challenge, globalState.passTxt, 'darkgreen'],
        [challengeIcon, globalState.passIcon]
      )
    } else {
      setInnerTextAndColorOptional(
        [challenge, globalState.challengeTxt, 'darkorange', true],
        [challengeIcon, globalState.challengeIcon]
      )
    }
    globalState.cardValues = []
    dealButton.innerText = 'Siguiente'
  }

  if (end) {
    resetAllElems()
    globalState.currentPlayerIndex = getNextArrayIndex(
      globalState.players,
      globalState.currentPlayerIndex
    )
    currentPlayer.innerText =
      globalState.players[globalState.currentPlayerIndex]
    dealButton.innerText = 'Carta'
  }
})

reloadPage.addEventListener('click', () => {
  globalState.players = null
  globalState.currentPlayerIndex = 0
  globalState.challengeTxt = ''
  globalState.challengeIcon = ''
  globalState.rounds = 0
  resetAllElems()
  initGameForm.classList.remove('hidden')
})
