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
				href: "/", 
				icon: "@/github", 
				type: "standard",
			},
			{ 
				label: "LinkedIn", 
				href: "/", 
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