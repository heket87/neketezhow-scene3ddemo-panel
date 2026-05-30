import React from 'react';
import { ColorPicker, Input, Icon, useStyles2, useTheme2 } from '@grafana/ui';
import { css } from '@emotion/css';
import { GrafanaTheme2 } from '@grafana/data';

export function ColorEditor(props: any) {
  const styles = useStyles2(getStyles);
  const theme = useTheme2();

  const suffix = props.value ? (
    <Icon
      className={styles.trashIcon}
      name="trash-alt"
      onClick={() => props.onChange(undefined)}
    />
  ) : null;

  const prefix = (
    <div className={styles.inputPrefix}>
      <div className={styles.colorPicker}>
        <ColorPicker
          color={props.value || theme.components.panel.background}
          onChange={props.onChange}
          enableNamedColors={false}
        />
      </div>
    </div>
  );

  return (
    <div>
      <Input
        type="text"
        value={props.value || 'Pick Color'}
        prefix={prefix}
        suffix={suffix}
        readOnly={true}
      />
    </div>
  );
}

const getStyles = (theme: GrafanaTheme2) => {
  return {
    colorPicker: css`
      padding: ${theme.spacing(0, 1)};
    `,
    inputPrefix: css`
      display: flex;
      align-items: center;
    `,
    trashIcon: css`
      color: ${theme.colors.text.secondary};
      cursor: pointer;

      &:hover {
        color: ${theme.colors.text.primary};
      }
    `,
  };
};
