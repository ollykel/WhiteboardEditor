import FooterItem, 
{ 
	type FooterItemType 
} from "./FooterItem"

export type FooterSectionType = {
	title?: string,
	items: FooterItemType[],
}

const FooterSection = ({
	title,
	items,
}: FooterSectionType) => {
	return (
		<div className="flex flex-col place-items-center p-8 px-20">
			{title && <h4 className="font-semibold mb-2 p-2">{title}</h4>}
			<ul className="space-y-2">
				{items.map((item) => (
					<FooterItem key={item.label} {...item} />
				))}
			</ul>
		</div>
	);
}

export default FooterSection;
