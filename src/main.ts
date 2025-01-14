import './elements/e-tags';
import './style.css';

const tags_el = document.querySelector('e-tags')!;
tags_el.tags = [
	'Docker',
	'Kubernetes',
	'AWS',
	'GraphQL',
	'MongoDB',
	'PostgreSQL',
	'Redis',
	'Git',
	'WebPack',
	'Vite',
	'Cypress',
	'Storybook',
	'Tailwind',
	'Prisma',
	'Nginx',
];

tags_el.addEventListener('selected-tags-changed', e => {
	console.log(e.selected_tags);
});
