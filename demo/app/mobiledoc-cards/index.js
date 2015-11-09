import { inputCard } from './input';
import { simpleCard } from './simple';
import { selfieCard } from './selfie';
import { imageCard } from './image';

export let cardsList = [
  inputCard,
  simpleCard,
  selfieCard,
  imageCard
];

export let cardsHash = {
  ['input-card']: inputCard,
  ['simple-card']: simpleCard,
  ['selfie-card']: selfieCard,
  ['image-card']: imageCard
};
