export default function getSimpleExcise({
  itemCategoryId,
  uom = 0,
  itemPrice = 0,
}: {
  itemCategoryId: number;
  uom?: number;
  itemPrice?: number;
}): { temp_excise: number; temp_excise2: number } {
  let temp_excise = 0;
  let temp_excise2 = 0;

  switch (itemCategoryId) {
    case 1:
      const factor = 1.3216;
      const rate = 0.12;
      temp_excise = (itemPrice / factor) * rate;
      temp_excise2 = (uom * 60) / 1000;
      break;

    case 2:
      temp_excise = (uom * 100) / 1000;
      temp_excise2 = (uom * 100) / 1000;
      break;

    case 3:
      temp_excise = (uom * 100) / 1000;
      temp_excise2 = (uom * 100) / 1000;
      break;

    case 4:
      temp_excise = (uom * 100) / 1000;
      temp_excise2 = (uom * 100) / 1000;
      break;

    case 5:
      temp_excise = (uom * 100) / 1000;
      temp_excise2 = (uom * 100) / 1000;
      break;

    case 6:
      temp_excise = (uom * 100) / 1000;
      temp_excise2 = (uom * 100) / 1000;
      break;

    default:
      temp_excise = 0;
      temp_excise2 = 0;
      break;
  }

  return { temp_excise, temp_excise2 };
}
