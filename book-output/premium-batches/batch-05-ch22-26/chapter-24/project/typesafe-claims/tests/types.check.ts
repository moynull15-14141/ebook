// Compile-time Test: এই File কিছু চালায় না। প্রতিটি @ts-expect-error-এর পরের
// লাইনে Type Error থাকতেই হবে; না থাকলে tsc নিজেই ব্যর্থ হয়। অর্থাৎ Type-এর
// নিশ্চয়তাগুলো (Brand, Union, readonly) কেউ ভুল করে ঢিলে করলে Build ভাঙবে।
import type {
  Claim, ClaimId, ClaimItem, Paisa, StatusCounts,
} from '../src/types.js';
import { toPaisa } from '../src/money.js';

export function compileTimeChecks(claim: Claim): void {
  // @ts-expect-error সাধারণ number সরাসরি Paisa নয়; toPaisa দিয়ে যাচাই করতে হয়।
  const raw: Paisa = 500;

  // @ts-expect-error সাধারণ string ClaimId নয়।
  const id: ClaimId = 'EC-1';

  // @ts-expect-error hotel-এর nights বাধ্যতামূলক।
  const hotel: ClaimItem = { kind: 'hotel', city: 'Sylhet', amount: toPaisa(1) };

  const meal: ClaimItem = {
    kind: 'meal', people: 2, amount: toPaisa(1),
    // @ts-expect-error meal-এ city নেই (Union-এর ভুল সদস্য)।
    city: 'x',
  };

  // @ts-expect-error readonly Field বদলানো যায় না।
  claim.status = 'paid';

  // @ts-expect-error Record<ClaimStatus, number>-এ প্রতিটি অবস্থা লাগবে।
  const counts: StatusCounts = { draft: 0, submitted: 0 };

  void [raw, id, hotel, meal, counts];
}
