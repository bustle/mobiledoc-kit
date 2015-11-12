import inputCard from './input';
import simpleCard from './simple';
import selfieCard from './selfie';
import imageCard from './image';
import codemirrorCard from './codemirror';

export let cardsList = [
  inputCard,
  simpleCard,
  selfieCard,
  imageCard,
  codemirrorCard
];

let cardsHash = {};
cardsList.forEach(card => {
  cardsHash[card.name] = card;
});
export { cardsHash };
