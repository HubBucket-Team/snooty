import React from 'react';
import PropTypes from 'prop-types';
import Card from './Card';

const CATEGORIES = [
  {
    name: 'Getting Started',
    iconSlug: 'getting-started',
  },
  {
    name: 'Use Case',
    iconSlug: 'use-case',
  },
  {
    name: 'Deep Dive',
    iconSlug: 'deep-dive',
  },
];

/**
 * Recursively searches the AST to find the guide category ('type').
 * Prevents us from having to rely on a fixed depth for this property.
 */
const getGuideType = nodes => {
  let result;
  const iter = node => {
    if (node.name === 'type') {
      result = node.argument[0].value;
      return true;
    }
    return Array.isArray(node.children) && node.children.some(iter);
  };

  nodes.some(iter);
  return result;
};

const Category = ({ cards, category, refDocMapping }) =>
  cards.length > 0 && (
    <section className="guide-category" key={category.iconSlug}>
      <div className={`guide-category__title guide-category__title--${category.iconSlug}`}>{category.name}</div>
      <div className="guide-category__guides">
        {cards.map((card, index) => (
          <Card card={card} key={index} refDocMapping={refDocMapping} />
        ))}
      </div>
    </section>
  );

const LandingPageCards = ({ guides, refDocMapping }) =>
  CATEGORIES.map(category => (
    <Category
      cards={guides.filter(card => {
        const cardName =
          card.name === 'card' ? card.argument[0].value : card.children[0].children[0].children[0].children[0].value;
        return category.name === getGuideType(refDocMapping[cardName].ast.children);
      })}
      category={category}
      refDocMapping={refDocMapping}
      key={category.iconSlug}
    />
  ));

Category.propTypes = {
  cards: PropTypes.arrayOf(PropTypes.object),
  category: PropTypes.shape({
    name: PropTypes.string.isRequired,
    iconSlug: PropTypes.string.isRequired,
  }).isRequired,
  refDocMapping: PropTypes.shape({
    index: PropTypes.shape({
      ast: PropTypes.object,
    }).isRequired,
  }).isRequired,
};

Category.defaultProps = {
  cards: [],
};

LandingPageCards.propTypes = {
  guides: PropTypes.arrayOf(
    PropTypes.shape({
      argument: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string,
        })
      ),
      children: PropTypes.array,
      name: PropTypes.string,
    })
  ),
  refDocMapping: PropTypes.shape({
    index: PropTypes.shape({
      ast: PropTypes.object,
    }).isRequired,
  }).isRequired,
};

LandingPageCards.defaultProps = {
  guides: [],
};

export default LandingPageCards;
