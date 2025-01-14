import { LitElement, html, css, TemplateResult, PropertyValueMap } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { repeat } from 'lit/directives/repeat.js';
import { startViewTransition } from '../transition';

@customElement('e-tags')
export class TagsElement extends LitElement {
	@property({ type: Array }) tags: Array<string> = [];
	@property({ type: Array }) selected_tags: Array<string> = [];

	@state() private not_selected_tags: Array<string> = [];
	@state() private orders: Map<string, number> = new Map();

	protected willUpdate(changed: PropertyValueMap<this>): void {
		if (changed.has('selected_tags') || changed.has('tags')) {
			this.not_selected_tags = this.tags.filter(tag => !this.selected_tags.includes(tag));
		}

		if (changed.has('tags')) {
			this.#apply_global_view_transition_names_stylesheet();
			this.orders = create_orders(this.tags);
		}
	}

	connectedCallback(): void {
		super.connectedCallback();
		this.#apply_global_view_transition_names_stylesheet();
	}

	#apply_global_view_transition_names_stylesheet() {
		const SHEET_ID = 'e-tags__view-transitions';
		const el = document.head.querySelector(SHEET_ID) ?? document.createElement('style');

		const rules = this.tags
			.map(tag => {
				const id = tag_id(tag);
				return `e-tags::part(${id}){view-transition-name:${id}}`;
			})
			.join('\n');

		el.innerHTML = rules;
		document.head.append(el);
	}

	protected render(): TemplateResult {
		return html`<div>
			<div id="selected-tags">
				${repeat(
					this.selected_tags,
					tag => tag,
					tag =>
						html`<button
							style="order:${this.orders.get(tag)}"
							part="selected-tag ${tag_id(tag)}"
							@click=${() => this.unselect(tag)}
						>
							${tag} <span>X</span>
						</button>`
				)}
			</div>
			<div part="tags" id="tags">
				${repeat(
					this.not_selected_tags,
					tag => tag,
					tag =>
						html`<button
							style="order:${this.orders.get(tag)}"
							part="tag ${tag_id(tag)}"
							@click=${() => this.select(tag)}
						>
							${tag}
						</button>`
				)}
			</div>
		</div>`;
	}

	async select(tag: string) {
		if (!this.tags.includes(tag)) {
			return;
		}

		const transition = startViewTransition(async () => {
			this.selected_tags = [...this.selected_tags, tag];
		});
		if (transition) {
			await transition.finished;
		}
		this.dispatchEvent(new SelectedTagsChangeEvent(this.selected_tags));
	}

	async unselect(tag: string) {
		if (!this.selected_tags.includes(tag)) {
			return;
		}

		const transition = startViewTransition(async () => {
			this.selected_tags = this.selected_tags.filter(t => t !== tag);
		});
		if (transition) {
			await transition.finished;
		}
		this.dispatchEvent(new SelectedTagsChangeEvent(this.selected_tags));
	}

	static styles = css`
		* {
			box-sizing: border-box;
		}

		#selected-tags {
			display: flex;
			flex-wrap: wrap;
			gap: 12px;
			width: 400px;
			min-height: 48px;
			padding: 12px;
			border: 1px solid #e4e4e7;
			border-radius: 12px;
			font-size: 16px;
			margin-bottom: 24px;

			button {
				box-shadow: rgba(0, 0, 0, 0) 0px 0px 0px 0px, rgba(0, 0, 0, 0) 0px 0px 0px 0px,
					rgba(0, 0, 0, 0.1) 0px 4px 6px -1px, rgba(0, 0, 0, 0.1) 0px 2px 4px -2px;
				background-color: #ffffff;
				border: 1px solid #e4e4e7;
				order: 0 !important;
			}

			button span {
				display: inline-block;
			}
		}

		#tags {
			display: flex;
			flex-wrap: wrap;
			gap: 12px;
			padding: 12px;
			background: white;
			border-radius: 16px;
			border: 1px solid #e4e4e7;
			width: 400px;
		}

		button {
			padding: 8px;
			background: #f4f4f5;
			border-radius: 8px;
			font-size: 16px;
			color: #27272a;
			cursor: pointer;
			border: none;
			font-weight: 500;
			display: flex;
			align-items: center;
			gap: 8px;

			span {
				display: none;
			}
		}
	`;
}

function create_orders(tags: Array<string>): Map<string, number> {
	return new Map(tags.map((tag, index) => [tag, index]));
}

function tag_id(tag: string): string {
	return tag.toLowerCase();
}

declare global {
	interface HTMLElementTagNameMap {
		'e-tags': TagsElement;
	}
}

declare global {
	interface HTMLElementEventMap {
		'selected-tags-changed': SelectedTagsChangeEvent;
	}
}
export class SelectedTagsChangeEvent extends Event {
	static readonly tag = 'selected-tags-changed';
	selected_tags: Array<string>;

	constructor(selected_tags: Array<string>, options?: EventInit) {
		super(SelectedTagsChangeEvent.tag, options);
		this.selected_tags = selected_tags;
	}
}
