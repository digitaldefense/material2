/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {
  AfterContentInit,
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Directive,
  ElementRef,
  Inject,
  isDevMode,
  QueryList,
  Renderer2,
  ViewEncapsulation
} from '@angular/core';
import {CanColor, mixinColor, FlxThemeService, FlxTheme} from '@angular/material/core';
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import {Platform} from '@angular/cdk/platform';
import {DOCUMENT} from '@angular/common';

// Boilerplate for applying mixins to MatToolbar.
/** @docs-private */
export class MatToolbarBase {
  constructor(
    public _elementRef: ElementRef,
    public _renderer: Renderer2,
    public _themeSvc: FlxThemeService) {}
}
export const _MatToolbarMixinBase = mixinColor(MatToolbarBase);

@Directive({
  selector: 'mat-toolbar-row',
  exportAs: 'matToolbarRow',
  host: {'class': 'mat-toolbar-row'},
})
export class MatToolbarRow {}

@Component({
  moduleId: module.id,
  selector: 'mat-toolbar',
  exportAs: 'matToolbar',
  templateUrl: 'toolbar.html',
  styleUrls: ['toolbar.css'],
  inputs: ['color'],
  host: {
    'class': 'mat-toolbar',
    '[class.mat-toolbar-multiple-rows]': 'this._toolbarRows.length',
    '[class.mat-toolbar-single-row]': '!this._toolbarRows.length'
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  preserveWhitespaces: false,
})
export class MatToolbar extends _MatToolbarMixinBase implements CanColor, AfterViewInit,
        AfterContentInit {
  private _document: Document;
  private _theme: FlxTheme;

  /** Reference to all toolbar row elements that have been projected. */
  @ContentChildren(MatToolbarRow) _toolbarRows: QueryList<MatToolbarRow>;

  /** Reference all toolbar controls */
  @ContentChildren(MatButton) _controls: QueryList<MatButton>;

  /** Reference all toolbar icons */
  @ContentChildren(MatIcon) _icons: QueryList<MatIcon>;

  constructor(
    elementRef: ElementRef,
    renderer: Renderer2,
    themeSvc: FlxThemeService,
    private _platform: Platform,
    @Inject(DOCUMENT) document?: any) {
    super(elementRef, renderer, themeSvc);

    // TODO: make the document a required param when doing breaking changes.
    this._document = document;

    this._theme = this._themeSvc.theme.getValue();
  }

  ngAfterViewInit() {
    if (!isDevMode() || !this._platform.isBrowser) {
      return;
    }

    this._checkToolbarMixedModes();
    this._toolbarRows.changes.subscribe(() => this._checkToolbarMixedModes());

    // if (this._controls) {
    //   this._controls.forEach(btn => { btn.color = 'primaryContrast'; });
    // }

  }

  ngAfterContentInit() {
    if (this.color !== undefined && this._controls) {
      this._controls.forEach(btn => { btn.color = `${this.color}Contrast`; });
    }
  }

  /**
   * Throws an exception when developers are attempting to combine the different toolbar row modes.
   */
  private _checkToolbarMixedModes() {
    if (!this._toolbarRows.length) {
      return;
    }

    // Check if there are any other DOM nodes that can display content but aren't inside of
    // a <mat-toolbar-row> element.
    const isCombinedUsage = [].slice.call(this._elementRef.nativeElement.childNodes)
      .filter(node => !(node.classList && node.classList.contains('mat-toolbar-row')))
      .filter(node => node.nodeType !== (this._document ? this._document.COMMENT_NODE : 8))
      .some(node => node.textContent.trim());

    if (isCombinedUsage) {
      throwToolbarMixedModesError();
    }
  }
}

/**
 * Throws an exception when attempting to combine the different toolbar row modes.
 * @docs-private
 */
export function throwToolbarMixedModesError() {
  throw Error('MatToolbar: Attempting to combine different toolbar modes. ' +
    'Either specify multiple `<mat-toolbar-row>` elements explicitly or just place content ' +
    'inside of a `<mat-toolbar>` for a single row.');
}
