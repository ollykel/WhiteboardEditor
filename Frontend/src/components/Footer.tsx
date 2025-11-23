import { defaultFooterConfig, type FooterConfigType } from "./footer.config";
import FooterSection from "./FooterSection";

interface FooterProps {
	config?: FooterConfigType,
}

const Footer = ({
	config = defaultFooterConfig,
}: FooterProps) => {
	return (
		<footer className="flex flex-row items-start flex-wrap justify-center mt-20 px-36 py-8 border-t-1 border-border bg-bar-background">
			{config.map((section) => (
				<FooterSection
					key={section.title}
					title={section.title}
					items={section.items}
				/>
			))}
		</footer>
	);
}

export default Footer;