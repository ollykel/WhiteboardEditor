import type { FooterSectionType } from "./FooterSection";
import BoardlyIcon from "@/assets/icons/boardly.svg";

export type FooterConfigType = FooterSectionType[];

export const defaultFooterConfig: FooterConfigType = [
	{
		title: "",
		items: [
			{
				label: "Boardly", 
				href: "/", 
				icon: BoardlyIcon, 
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
				icon: "icons/github-mark-white.svg", 
				type: "standard",
			},
			{ 
				label: "LinkedIn", 
				href: "https://www.linkedin.com/in/oliver-andrew-k/", 
				icon: "icons/LI-In-Bug.png",
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
];