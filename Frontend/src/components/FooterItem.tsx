export type FooterItemBase = {
	label: string;
	href?: string;
	icon?: string;
};

export type FooterItemType =
	| (FooterItemBase & { type: "standard" })
	| (FooterItemBase & { type: "header" })
	| (FooterItemBase & { type: "footnote" });

const FooterItem = ({
	label, 
	href, 
	icon,
	type,
}: FooterItemType) => {
	const variants = {
		header: "flex items-center gap-4 p-2 font-bold text-lg",
		standard: "flex items-center gap-4 p-2 hover:opacity-80",
		footnote: "text-xs text-gray-500"
	};

	const imageSize = type === "header" ? 24 : 18;

	return (		
		<a href={href} className={variants[type]}>
			{icon && <img src={icon} width={imageSize} height={imageSize} alt={label + " icon"} />}
			{label}
		</a>
	);
}

export default FooterItem;