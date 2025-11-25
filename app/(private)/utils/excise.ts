
export type Item = {
	id?: number;
	excies?: number | boolean;
	item_category?: number;
	baseuom?: number;
	base_uom_price?: number;
	base_uom_vol?: number;
	alter_uom_vol?: number;
	base_ulternet_umo_price?: number;
	agent_excise?: number;
	direct_sell_excise?: number;
	[key: string]: any;
};

type FormulaFn = (params: {
	item: Item;
	uom: number;
	itemPrice?: number | null;
}) => { temp_excise: number; temp_excise2: number };

const safeNum = (v: any) => {
	const n = Number(v);
	return Number.isFinite(n) ? n : 0;
};

const getPrice = (item: Item, useAlternate = false) => {
	if (useAlternate) return safeNum(item.base_ulternet_umo_price || item.base_ulternet_umo_price || item.alter_uom_price);
	return safeNum(item.base_uom_price);
};

const formulas: Record<number, FormulaFn> = {
	8: ({ item, uom, itemPrice }) => {
		const factor = 1.3216;
		const rate = 0.12;
		const isBase = safeNum(item.baseuom) === safeNum(uom);
		const price = itemPrice != null ? safeNum(itemPrice) : (isBase ? getPrice(item, false) : safeNum(item.base_ulternet_umo_price));
		const temp_excise = (price / factor) * rate;
		const vol = isBase ? safeNum(item.base_uom_vol) : safeNum(item.alter_uom_vol);
		const temp_excise2 = vol * 250;
        console.log("Excise calc for cat 8:", { temp_excise, temp_excise2, price, vol, isBase });
		return { temp_excise, temp_excise2 };
	},
	3: ({ item, uom, itemPrice }) => {
		const factor = 1.298;
		const rate = 0.10;
		const price = itemPrice != null ? safeNum(itemPrice) : getPrice(item, false);
		const temp_excise = (price / factor) * rate;
		return { temp_excise, temp_excise2: 0 };
	},
	4: ({ item, uom, itemPrice }) => {
		const factor = 1.3334;
		const rate = 0.12;
		const isBase = safeNum(item.baseuom) === safeNum(uom);
		const price = itemPrice != null ? safeNum(itemPrice) : (isBase ? getPrice(item, false) : safeNum(item.base_ulternet_umo_price));
		const temp_excise = (price / factor) * rate;
		const vol = isBase ? safeNum(item.base_uom_vol) : safeNum(item.alter_uom_vol);
		const temp_excise2 = vol * 250;
		return { temp_excise, temp_excise2 };
	},
	5: ({ item, uom, itemPrice }) => {
		const isBase = safeNum(item.baseuom) === safeNum(uom);
		const agentExcise = safeNum(item.agent_excise);
		const directExcise = safeNum(item.direct_sell_excise);
		const basePrice = isBase ? getPrice(item, false) : safeNum(item.base_ulternet_umo_price);
		const temp_excise = basePrice ? (basePrice * agentExcise) / 100 : 0;
		const temp_excise2 = basePrice ? (100 * agentExcise) / (basePrice || 1) : 0;
		return { temp_excise, temp_excise2 };
	}
};

export function getExcise({
	item,
	uom = 0,
	quantity = 1,
	itemPrice = null,
	orderType = 0
}: {
	item: Item | null | undefined;
	uom?: number;
	quantity?: number;
	itemPrice?: number | null | '';
	orderType?: number;
}): number {
	console.log("Calculating excise for item:", item, "uom:", uom, "quantity:", quantity, "itemPrice:", itemPrice, "orderType:", orderType);
	let excise = 0;
	if (!item) return 0;
	const hasExcies = item.excies === 1 || item.excies === true || safeNum(item.excies) === 1;
	console.log("Item has excies:", hasExcies, item.excies);
	if (!hasExcies) return 0;
	console.log("is in formulas");

	const cat = safeNum(item.item_category);
	let temp_excise = 0;
	let temp_excise2 = 0;
	const normalizedItemPrice = itemPrice === null || itemPrice === '' ? null : safeNum(itemPrice);

	if (cat in formulas) {
		const res = formulas[cat]({ item, uom, itemPrice: normalizedItemPrice });
		temp_excise = safeNum(res.temp_excise);
		temp_excise2 = safeNum(res.temp_excise2);

		if (cat === 5) {
			const exciseVal = orderType === 2 ? safeNum(item.agent_excise) : safeNum(item.direct_sell_excise);
			if (normalizedItemPrice != null) {
				temp_excise = (100 * exciseVal) / safeNum(normalizedItemPrice || 1);
				temp_excise2 = temp_excise;
			} else {
				const basePrice = safeNum(item.base_uom_price) || safeNum(item.base_ulternet_umo_price);
				if (orderType === 2) {
					temp_excise = (basePrice * safeNum(item.agent_excise)) / 100;
					temp_excise2 = basePrice ? (100 * safeNum(item.agent_excise)) / basePrice : 0;
				} else {
					temp_excise = (basePrice * safeNum(item.direct_sell_excise || item.agent_excise)) / 100;
					temp_excise2 = (basePrice * safeNum(item.direct_sell_excise || item.agent_excise)) / 100;
				}
			}
		}
	}

	excise = Math.max(temp_excise, temp_excise2);
	if (excise > 0) {
		excise = excise * (quantity || 1);
		excise = Math.round(excise * 100) / 100;
	}
	return excise;
}

export default getExcise;
