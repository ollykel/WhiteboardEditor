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
		header: "font-bold text-lg text-h2-text",
		standard: "text-md text-h2-text",
		footnote: "text-xs text-gray-500"
	};

	const imageSize = type === "header" ? 24 : 18;

	return (		
		<a href={href} className={"flex items-center gap-4 p-2 hover:opacity-80 " + variants[type]}>
			{icon && <img src={icon} width={imageSize} height={imageSize} alt={label + " icon"} />}
			{label}
		</a>
	);
}

export default FooterItem;