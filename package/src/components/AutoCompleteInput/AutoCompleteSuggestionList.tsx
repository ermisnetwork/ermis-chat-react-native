import React, { useMemo, useState } from 'react';
import {
  LayoutChangeEvent,
  Pressable,
  PressableProps,
  PressableStateCallbackType,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';

import type { AutoCompleteSuggestionHeaderProps } from './AutoCompleteSuggestionHeader';
import type { AutoCompleteSuggestionItemProps } from './AutoCompleteSuggestionItem';

import {
  isSuggestionUser,
  Suggestion,
  SuggestionsContextValue,
  useSuggestionsContext,
} from '../../contexts/suggestionsContext/SuggestionsContext';
import { useTheme } from '../../contexts/themeContext/ThemeContext';
import { FlatList } from '../../native';
import type { DefaultErmisChatGenerics } from '../../types/types';

const AUTO_COMPLETE_SUGGESTION_LIST_HEADER_HEIGHT = 50;

type AutoCompleteSuggestionListComponentProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<SuggestionsContextValue, 'queryText' | 'triggerType'> & {
  active: boolean;
  data: Suggestion<ErmisChatGenerics>[];
  onSelect: (item: Suggestion<ErmisChatGenerics>) => void;
};

export type AutoCompleteSuggestionListPropsWithContext<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = Pick<
  SuggestionsContextValue<ErmisChatGenerics>,
  'AutoCompleteSuggestionHeader' | 'AutoCompleteSuggestionItem'
> &
  AutoCompleteSuggestionListComponentProps<ErmisChatGenerics>;

const SuggestionsItem = (props: PressableProps) => {
  const { children, style: propsStyle, ...pressableProps } = props;

  const style = ({ pressed }: PressableStateCallbackType) => [
    propsStyle as ViewStyle,
    { opacity: pressed ? 0.2 : 1 },
  ];

  return (
    <Pressable {...pressableProps} style={style}>
      {children}
    </Pressable>
  );
};

SuggestionsItem.displayName = 'SuggestionsHeader{messageInput{suggestions}}';

export const AutoCompleteSuggestionListWithContext = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: AutoCompleteSuggestionListPropsWithContext<ErmisChatGenerics>,
) => {
  const [itemHeight, setItemHeight] = useState<number>(0);
  const {
    active,
    AutoCompleteSuggestionHeader,
    AutoCompleteSuggestionItem,
    data,
    onSelect,
    queryText,
    triggerType,
  } = props;

  const {
    theme: {
      colors: { white },
      messageInput: {
        container: { maxHeight },
        suggestions: { item: itemStyle },
        suggestionsListContainer: { flatlist },
      },
    },
  } = useTheme();

  const flatlistHeight = useMemo(() => {
    let totalItemHeight;
    if (triggerType === 'emoji') {
      totalItemHeight = data.length < 7 ? data.length * itemHeight : itemHeight * 6;
    } else {
      totalItemHeight = data.length < 4 ? data.length * itemHeight : itemHeight * 3;
    }

    return triggerType === 'emoji' || triggerType === 'command'
      ? totalItemHeight + AUTO_COMPLETE_SUGGESTION_LIST_HEADER_HEIGHT
      : totalItemHeight;
  }, [itemHeight, data.length]);

  const renderItem = ({ item }: { item: Suggestion<ErmisChatGenerics> }) => {
    switch (triggerType) {
      case 'command':
      case 'mention':
      case 'emoji':
        return (
          <SuggestionsItem
            onLayout={(event: LayoutChangeEvent) => setItemHeight(event.nativeEvent.layout.height)}
            onPress={() => {
              onSelect(item);
            }}
            style={itemStyle}
          >
            {AutoCompleteSuggestionItem && (
              <AutoCompleteSuggestionItem itemProps={item} triggerType={triggerType} />
            )}
          </SuggestionsItem>
        );
      default:
        return null;
    }
  };

  if (!active || data.length === 0) return null;

  return (
    <View style={[styles.container, { backgroundColor: white, height: flatlistHeight }]}>
      <FlatList
        data={data}
        keyboardShouldPersistTaps='always'
        keyExtractor={(item, index) =>
          `${item.name || (isSuggestionUser(item) ? item.id : '')}${index}`
        }
        ListHeaderComponent={
          AutoCompleteSuggestionHeader ? (
            <AutoCompleteSuggestionHeader queryText={queryText} triggerType={triggerType} />
          ) : null
        }
        renderItem={renderItem}
        style={[flatlist, { maxHeight }]}
      />
    </View>
  );
};

const areEqual = <ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics>(
  prevProps: AutoCompleteSuggestionListPropsWithContext<ErmisChatGenerics>,
  nextProps: AutoCompleteSuggestionListPropsWithContext<ErmisChatGenerics>,
) => {
  const {
    active: prevActive,
    data: prevData,
    queryText: prevQueryText,
    triggerType: prevType,
  } = prevProps;
  const {
    active: nextActive,
    data: nextData,
    queryText: nextQueryText,
    triggerType: nextType,
  } = nextProps;

  const activeEqual = prevActive === nextActive;
  if (!activeEqual) return false;

  const queryTextEqual = prevQueryText === nextQueryText;
  if (!queryTextEqual) return false;

  const dataEqual = prevData === nextData;
  if (!dataEqual) return false;

  const typeEqual = prevType === nextType;
  if (!typeEqual) return false;

  return true;
};

const MemoizedAutoCompleteSuggestionList = React.memo(
  AutoCompleteSuggestionListWithContext,
  areEqual,
) as typeof AutoCompleteSuggestionListWithContext;

export type AutoCompleteSuggestionListProps<
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
> = AutoCompleteSuggestionListComponentProps<ErmisChatGenerics> & {
  AutoCompleteSuggestionHeader?: React.ComponentType<AutoCompleteSuggestionHeaderProps>;
  AutoCompleteSuggestionItem?: React.ComponentType<
    AutoCompleteSuggestionItemProps<ErmisChatGenerics>
  >;
};

export const AutoCompleteSuggestionList = <
  ErmisChatGenerics extends DefaultErmisChatGenerics = DefaultErmisChatGenerics,
>(
  props: AutoCompleteSuggestionListProps<ErmisChatGenerics>,
) => {
  const { AutoCompleteSuggestionHeader, AutoCompleteSuggestionItem } =
    useSuggestionsContext<ErmisChatGenerics>();

  return (
    <MemoizedAutoCompleteSuggestionList
      {...{ AutoCompleteSuggestionHeader, AutoCompleteSuggestionItem }}
      {...props}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 8,
    elevation: 3,
    marginHorizontal: 8,
    marginVertical: 8,
    shadowOffset: { height: 1, width: 0 },
    shadowOpacity: 0.15,
  },
});

AutoCompleteSuggestionList.displayName =
  'AutoCompleteSuggestionList{messageInput{suggestions{List}}}';
