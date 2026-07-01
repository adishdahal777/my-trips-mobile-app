/**
 * Suggests a mood emoji for a note from its text using a keyword heuristic.
 * Returns one of the note editor's four moods: 😊 😍 🤩 ❤️.
 */
export function suggestMood(text: string): string {
  const t = text.toLowerCase();
  if (/amazing|incredible|unreal|unbelievable|wow|epic|mind.?blow|breathtaking/.test(t)) return "🤩";
  if (/love|beautiful|gorgeous|stunning|romantic|magical|dreamy/.test(t)) return "😍";
  if (/favorite|favourite|heart|best ever|adore|cherish/.test(t)) return "❤️";
  return "😊";
}
