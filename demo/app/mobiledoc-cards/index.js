import { inputCard } from './input';
import { simpleCard } from './simple';
import { selfieCard } from './selfie';

export let cardsList = [
  inputCard,
  simpleCard,
  selfieCard
];

export let cardsHash = {
  ['input-card']: inputCard,
  ['simple-card']: simpleCard,
  ['selfie-card']: selfieCard
};
