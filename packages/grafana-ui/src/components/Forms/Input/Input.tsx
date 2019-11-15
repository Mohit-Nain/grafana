import React, { FC, HTMLProps, ReactNode } from 'react';
import { GrafanaTheme } from '@grafana/data';
import { css, cx } from 'emotion';
import { getFocusStyle } from '../commonStyles';
import { selectThemeVariant, stylesFactory, useTheme } from '../../../themes';
import { Icon } from '../../Icon/Icon';
import { useClientRect } from '../../../utils/useClientRect';

export interface Props extends Omit<HTMLProps<HTMLInputElement>, 'prefix'> {
  /** Show an invalid state around the input */
  invalid?: boolean;
  /** Show an icon as a prefix in the input */
  prefix?: JSX.Element | string | null;
  /** Show a loading indicator as a suffix in the input */
  loading?: boolean;
  /** Add a component as an addon before the input  */
  addonBefore?: ReactNode;
  /** Add a component as an addon after the input */
  addonAfter?: ReactNode;
}

const getInputStyle = stylesFactory((theme: GrafanaTheme, invalid = false) => {
  const colors = theme.colors;
  const backgroundColor = selectThemeVariant({ light: colors.white, dark: colors.gray15 }, theme.type);
  const borderColor = selectThemeVariant({ light: colors.gray4, dark: colors.gray25 }, theme.type);
  const inputBorderColor = invalid ? colors.redBase : borderColor;
  const borderRadius = theme.border.radius.sm;
  const height = theme.spacing.formInputHeight;
  const disabledBackground = selectThemeVariant({ light: colors.gray6, dark: colors.gray10 }, theme.type);
  const disabledColor = selectThemeVariant({ light: colors.gray33, dark: colors.gray70 }, theme.type);
  const inputTextColor = selectThemeVariant({ light: colors.gray25, dark: colors.gray85 }, theme.type);

  const prefixSuffixStaticWidth = '28px';
  const prefixSuffix = css`
    position: absolute;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 0;
    flex-shrink: 0;
    font-size: ${theme.typography.size.md};
    height: 100%;
    /* Min width specified for prefix/suffix classes used outside React component*/
    min-width: ${prefixSuffixStaticWidth};
  `;

  return {
    // Wraps inputWraper and addons
    wrapper: cx(
      css`
        label: input-wrapper;
        display: flex;
        width: 100%;
        height: ${height};
        border-radius: ${borderRadius};
        margin-bottom: ${invalid ? theme.spacing.formSpacingBase / 2 : theme.spacing.formSpacingBase * 2}px;
        &:hover {
          > .prefix,
          .suffix,
          .input {
            border-color: ${invalid
              ? colors.redBase
              : selectThemeVariant({ light: colors.gray70, dark: colors.gray33 }, theme.type)};
          }
        }
      `
    ),
    // Wraps input and prefix/suffix
    inputWrapper: css`
      label: input-inputWrapper;
      position: relative;
      flex-grow: 1;
      /* we want input to be above addons, especially for focused state */
      z-index: 1;

      /* when input rendered with addon before only*/
      &:not(:first-child):last-child {
        > input {
          border-left: none;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }

      /* when input rendered with addon after only*/
      &:first-child:not(:last-child) {
        > input {
          border-right: none;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
        }
      }

      /* when rendered with addon before and after */
      &:not(:first-child):not(:last-child) {
        > input {
          border-right: none;
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
        }
      }

      input {
        /* paddings specified for classes used outside React component */
        &:not(:first-child) {
          padding-left: ${prefixSuffixStaticWidth};
        }
        &:not(:last-child) {
          padding-right: ${prefixSuffixStaticWidth};
        }
      }
    `,

    input: cx(
      getFocusStyle(theme),
      css`
        label: input-input;
        position: relative;
        z-index: 0;
        flex-grow: 1;
        color: ${inputTextColor};
        background-color: ${backgroundColor};
        border: 1px solid ${inputBorderColor};
        border-radius: ${borderRadius};
        height: 100%;
        width: 100%;
        padding: 0 ${theme.spacing.sm} 0 ${theme.spacing.sm};
        font-size: ${theme.typography.size.md};

        &:disabled {
          background-color: ${disabledBackground};
          color: ${disabledColor};
        }

        /*
         Restoring increase/decrease spinner on number inputs. Overwriting rules implemented in
         https://github.com/grafana/grafana/commit/488fe62f158a9e0a0bced2b678ada5d43cf3998e.
         */

        &[type='number']::-webkit-outer-spin-button,
        &[type='number']::-webkit-inner-spin-button {
          -webkit-appearance: inner-spin-button !important;
          opacity: 1;
        }

        &[type='number'] {
          -moz-appearance: number-input;
        }
      `
    ),
    addon: css`
        label: input-addon;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-grow: 0;
        flex-shrink: 0;
        position: relative;

        &:first-child {
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          > :last-child {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
          }
        }

        &:last-child {
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          > :first-child {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
          }
        }
        > *:focus {
          /* we want anything that has focus and is an addon to be above input */
          z-index: 2;
        }
        }
      `,
    prefix: cx(
      prefixSuffix,
      css`
        label: input-prefix;
        padding-left: ${theme.spacing.sm};
        padding-right: ${theme.spacing.xs};
        border-right: none;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        left: 0;
      `
    ),
    suffix: cx(
      prefixSuffix,
      css`
        label: input-suffix;
        padding-right: ${theme.spacing.sm};
        padding-left: ${theme.spacing.xs};
        border-left: none;
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        right: 0;
      `
    ),
  };
});

export const Input: FC<Props> = props => {
  const { addonAfter, addonBefore, prefix, invalid, loading, ...restProps } = props;
  /**
   * Prefix & suffix are positioned absolutely within inputWrapper. We use client rects below to apply correct padding to the input
   * when prefix/suffix is larger than default (28px = 16px(icon) + 12px(left/right paddings)).
   * Thanks to that prefix/suffix do not overflow the input element itself.
   */
  const [prefixRect, prefixRef] = useClientRect<HTMLDivElement>();
  const [suffixRect, suffixRef] = useClientRect<HTMLDivElement>();
  const theme = useTheme();

  const styles = getInputStyle(theme, invalid);

  return (
    <div className={styles.wrapper}>
      {!!addonBefore && <div className={styles.addon}>{addonBefore}</div>}

      <div className={styles.inputWrapper}>
        {prefix && (
          <div className={styles.prefix} ref={prefixRef}>
            {prefix}
          </div>
        )}

        <input
          className={styles.input}
          {...restProps}
          style={{
            paddingLeft: prefixRect ? prefixRect.width : undefined,
            paddingRight: suffixRect ? suffixRect.width : undefined,
          }}
        />

        {loading && (
          <div className={styles.suffix} ref={suffixRef}>
            <Icon name="spinner" className="fa-spin" />
          </div>
        )}
      </div>

      {!!addonAfter && <div className={styles.addon}>{addonAfter}</div>}
    </div>
  );
};