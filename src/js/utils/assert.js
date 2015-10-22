export default function(message, conditional) {
  if (!conditional) {
    throw new Error(message);
  }
}
