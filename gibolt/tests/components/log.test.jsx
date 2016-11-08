import React from 'react';
import {shallow} from 'enzyme';
import Log from '../../frontend/src/components/Log';

it('Log changes', () => {
  // Render a checkbox with label in the document
  const log = shallow(
    <Log />
  );

  expect(log.text()).toEqual('');

  log.find('input').simulate('change', {'target': {'value': 'a'}});

  expect(log.text()).toEqual('a');
});

it('Log multiple changes', () => {
  // Render a checkbox with label in the document
  const log = shallow(
    <Log />
  );

  expect(log.find('li').length).toEqual(0);

  log.find('input').simulate('change', {'target': {'value': 'a'}});
  expect(log.find('li').length).toEqual(1);

  log.find('input').simulate('change', {'target': {'value': 'ab'}});
  expect(log.find('li').length).toEqual(2);
});

it('Log in the right order', () => {
  // Render a checkbox with label in the document
  const log = shallow(
    <Log />
  );

  expect(log.find('li').length).toEqual(0);

  log.find('input').simulate('change', {'target': {'value': 'a'}});
  expect(log.find('li').length).toEqual(1);
  expect(log.find('li').at(0).text()).toEqual('a');

  log.find('input').simulate('change', {'target': {'value': 'ab'}});
  expect(log.find('li').at(0).text()).toEqual('ab');
  expect(log.find('li').at(1).text()).toEqual('a');
});
