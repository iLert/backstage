/*
 * Copyright 2020 Spotify AB
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { InfoCard } from '@backstage/core';
import { Typography } from '@material-ui/core';
import { PeriodSelect } from '../PeriodSelect';
import { ProductInsightsChart } from './ProductInsightsChart';
import { ProductInsightsErrorCard } from './ProductInsightsErrorCard';
import { useProductInsightsCardStyles as useStyles } from '../../utils/styles';
import { DefaultLoadingAction } from '../../utils/loading';
import { Duration, Entity, Maybe, Product } from '../../types';
import {
  useLastCompleteBillingDate,
  useScroll,
  useLoading,
  MapLoadingToProps,
} from '../../hooks';
import { pluralOf } from '../../utils/grammar';

type LoadingProps = (isLoading: boolean) => void;

export type ProductInsightsCardProps = {
  product: Product;
  initialState: {
    entity: Maybe<Entity>;
    duration: Duration;
  };
  onSelectAsync: (product: Product, duration: Duration) => Promise<Entity>;
};

const mapLoadingToProps: MapLoadingToProps<LoadingProps> = ({ dispatch }) => (
  isLoading: boolean,
) => dispatch({ [DefaultLoadingAction.CostInsightsProducts]: isLoading });

export const ProductInsightsCard = ({
  initialState,
  product,
  onSelectAsync,
}: PropsWithChildren<ProductInsightsCardProps>) => {
  const classes = useStyles();
  const mountedRef = useRef(false);
  const { ScrollAnchor } = useScroll(product.kind);
  const [error, setError] = useState<Maybe<Error>>(null);
  const dispatchLoading = useLoading(mapLoadingToProps);
  const lastCompleteBillingDate = useLastCompleteBillingDate();
  const [entity, setEntity] = useState<Maybe<Entity>>(initialState.entity);
  const [duration, setDuration] = useState<Duration>(initialState.duration);

  /* eslint-disable react-hooks/exhaustive-deps */
  const dispatchLoadingProduct = useCallback(dispatchLoading, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  useEffect(() => {
    async function handleOnSelectAsync() {
      dispatchLoadingProduct(true);
      try {
        const e = await onSelectAsync(product, duration);
        setEntity(e);
      } catch (e) {
        setEntity(null);
        setError(e);
      } finally {
        dispatchLoadingProduct(false);
      }
    }

    if (mountedRef.current) {
      handleOnSelectAsync();
    }
  }, [product, duration, onSelectAsync, dispatchLoadingProduct]);

  useEffect(function hasComponentMounted() {
    mountedRef.current = true;
  }, []);

  const amount = entity?.entities?.length || 0;
  const hasCostsWithinTimeframe = !!(entity?.change && amount);

  const subheader = hasCostsWithinTimeframe
    ? `${amount} ${pluralOf(amount, 'entity', 'entities')}, sorted by cost`
    : null;

  const infoCardProps = {
    headerProps: {
      classes: classes,
      action: <PeriodSelect duration={duration} onSelect={setDuration} />,
    },
  };

  if (error || !entity) {
    return (
      <ProductInsightsErrorCard
        product={product}
        duration={duration}
        onSelect={setDuration}
      />
    );
  }

  return (
    <InfoCard title={product.name} subheader={subheader} {...infoCardProps}>
      <ScrollAnchor behavior="smooth" top={-12} />
      {hasCostsWithinTimeframe ? (
        <ProductInsightsChart
          duration={duration}
          entity={entity}
          billingDate={lastCompleteBillingDate}
        />
      ) : (
        <Typography>
          There are no {product.name} costs within this timeframe for your
          team's projects.
        </Typography>
      )}
    </InfoCard>
  );
};
