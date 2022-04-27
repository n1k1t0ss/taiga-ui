import {
    AfterViewInit,
    Directive,
    ElementRef,
    Inject,
    Input,
    NgZone,
    Optional,
    Renderer2,
    Self,
} from '@angular/core';
import {ANIMATION_FRAME, WINDOW} from '@ng-web-apis/common';
import {POLLING_TIME} from '@taiga-ui/cdk/constants';
import {
    TuiFocusableElementAccessor,
    TuiNativeFocusableElement,
} from '@taiga-ui/cdk/interfaces';
import {TUI_FOCUSABLE_ITEM_ACCESSOR, TUI_IS_IOS} from '@taiga-ui/cdk/tokens';
import {px} from '@taiga-ui/cdk/utils';
import {setNativeFocused} from '@taiga-ui/cdk/utils/focus';
import {Observable, race, timer} from 'rxjs';
import {map, skipWhile, take, throttleTime} from 'rxjs/operators';

const TIMEOUT = 1000;
const NG_ANIMATION_SELECTOR = '.ng-animating';

// TODO: in 3.0 change input name to tuiAutoFocus and handle empty string
// TODO: refactor on this whole thing in 3.0
// @dynamic
@Directive({
    selector: '[tuiAutoFocus]',
})
export class TuiAutoFocusDirective implements AfterViewInit {
    @Input()
    autoFocus = true;

    constructor(
        @Optional()
        @Self()
        @Inject(TUI_FOCUSABLE_ITEM_ACCESSOR)
        private readonly tuiFocusableComponent: TuiFocusableElementAccessor | null,
        @Inject(TUI_IS_IOS) private readonly isIos: boolean,
        @Inject(ANIMATION_FRAME) private readonly animationFrame$: Observable<number>,
        @Inject(NgZone)
        private readonly ngZone: NgZone,
        @Inject(ElementRef)
        private readonly elementRef: ElementRef<HTMLElement>,
        @Inject(Renderer2)
        private readonly renderer: Renderer2,
        @Inject(WINDOW) private readonly windowRef: Window,
    ) {}

    ngAfterViewInit(): void {
        if (!this.autoFocus) {
            return;
        }

        if (this.isTextFieldElement) {
            if (this.isIos) {
                this.ngZone.runOutsideAngular(() => this.iosWebkitAutofocus());
            } else {
                race(
                    timer(TIMEOUT),
                    this.animationFrame$.pipe(
                        throttleTime(POLLING_TIME),
                        map(() => this.element.closest(NG_ANIMATION_SELECTOR)),
                        skipWhile(Boolean),
                        take(1),
                    ),
                ).subscribe(() => setNativeFocused(this.element));
            }

            return;
        }

        setNativeFocused(this.element);
    }

    private get element(): TuiNativeFocusableElement {
        return (
            this.tuiFocusableComponent?.nativeFocusableElement ||
            this.elementRef.nativeElement
        );
    }

    private get isTextFieldElement(): boolean {
        return this.element.matches('input, textarea');
    }

    private iosWebkitAutofocus(): void {
        const fakeInput: HTMLInputElement = this.makeFakeInput();
        const duration = this.getMinAnimationTimeBeforeFocus();

        const blurHandler = (): void => fakeInput.focus({preventScroll: true});
        const focusHandler = (): void => {
            setTimeout(() => {
                this.element.focus({preventScroll: true});
                fakeInput.removeEventListener('blur', blurHandler);
                fakeInput.removeEventListener('focus', focusHandler);
                /**
                 * @note:
                 * We can't remove the element immediately, because it breaks flow
                 */
                setTimeout(() => fakeInput.remove(), duration);
            }, duration);
        };

        /**
         * @note: ping-pong eager strategy hack
         * After creating an element and bringing it into DOM,
         * the browser automatically focuses on the invisible element.
         * And then, after focus is triggered, we try to focus on target element, and if we managed to refocus,
         * then we try to focus again on an invisible element, so that the keyboard slowly appears.
         * This ping pong allows the keyboard to not overlap the modal window.
         */
        fakeInput.addEventListener('blur', blurHandler, {once: true});
        fakeInput.addEventListener('focus', focusHandler);

        this.element.parentElement?.appendChild(fakeInput);

        fakeInput.focus({preventScroll: true});
    }

    /**
     * @note:
     * We can't inject TUI_ANIMATION_DURATION
     * due to cyclic dependencies
     *
     * This value is needed if the user is overriding
     * the animation duration, so that browser frames redraws don't twitch when focus occurs
     */
    private getMinAnimationTimeBeforeFocus(): number {
        return (
            parseFloat(
                this.windowRef
                    .getComputedStyle(this.element)
                    .getPropertyValue('--tui-duration'),
            ) || 100
        );
    }

    private makeFakeInput(): HTMLInputElement {
        const fakeInput: HTMLInputElement = this.renderer.createElement('input');

        /**
         * @note: emulate textfield position in layout
         */
        fakeInput.style.height = px(this.element.clientHeight);
        fakeInput.style.width = px(this.element.clientWidth);
        fakeInput.style.position = 'absolute';
        fakeInput.style.opacity = '0';
        fakeInput.style.bottom = '0';

        return fakeInput;
    }
}
