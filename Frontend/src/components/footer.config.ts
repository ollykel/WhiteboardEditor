import type { FooterSectionType } from "./FooterSection";

export type FooterConfigType = FooterSectionType[];

export const defaultFooterConfig: FooterConfigType = [
	{
		title: "",
		items: [
			{
				label: "Boardly", 
				href: "/", 
				icon: "@/public/images/boardl.svg", 
				type: "header" 
			},
		],
	},
	{
		title: "Connect",
		items: [
			{ 
				label: "GitHub", 
				href: "https://github.com/ollykel/WhiteboardEditor", 
				icon: "@/github", 
				type: "standard",
			},
			{ 
				label: "LinkedIn", 
				href: "https://www.linkedin.com/in/oliver-andrew-k/", 
				icon: "@/linkedin",
				type: "standard",
			},
		],
	},
	{
		title: "",
		items: [
			{ 
				label: "About Us", 
				href: "/aboutUs",
				type: "standard", 
			},
		]
	},
	{
		title: "",
		items: [
			{ 
				label: "Feedback", 
				href: "/feedback",
				type: "standard",
			},
		]
	},
]