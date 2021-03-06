import React from 'react';
import PropTypes from 'prop-types';
import remark from 'remark';
import remark2react from 'remark-react';
import { withStyles } from '@material-ui/core/styles';

import styles from '../../../styles';
import Card from '../Card';
import Frame from '../Frame/';
import TranslationHelps from '../../../TranslationHelps';

// TODO: Show front/back matter
export const Component = ({
  classes,
  storyKey,
  story,
  context,
  setContext,
  helps,
  guide,
  title,
}) => {
  let intro;
  const header = `# ${title}`;
  const content = remark().use(remark2react).processSync(header).contents;
  let tabs = [];
  if (guide) {
    const title = "Guide"
    const text = guide;
    tabs.push({ title, text });
  }
  const details = (
    <TranslationHelps
      context={context}
      setContext={setContext}
      tabs={tabs}
    />
  );
  intro = (
    <Card
      context={context}
      content={content}
      details={details}
    />
  );
  const frames = Object.keys(story).map((frameKey, index) => {
    const {image, text} = story[frameKey];
    return (
      <Frame
        key={`${storyKey}:${frameKey}`}
        storyKey={storyKey}
        helps={index === 0 ? helps : {}}
        frameKey={frameKey}
        image={image}
        text={text}
        context={context}
        setContext={setContext}
      />
    );
  });
  return (
    <div className={classes.column}>
      {intro}
      {frames}
    </div>
  );
};

Component.propTypes = {
  classes: PropTypes.object.isRequired,
  storyKey: PropTypes.number.isRequired,
  story: PropTypes.object.isRequired,
  helps: PropTypes.object,
  context: PropTypes.object.isRequired,
  setContext: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default withStyles(styles)(Component);
