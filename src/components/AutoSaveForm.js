import React, { Component } from "react";

/**
 * Computes what to show in a form based on:
 * - previously saved draft
 * - latest db version of the entity
 * - default values
 *
 * TODO Consider merging entry with draft as well in case things changed in the meantime
 */
const getInitialFormValues = ({ draft, entity, defaultValues }) => {
  if (!draft && !entity) {
    return {
      ...defaultValues
    };
  }

  if (!draft) {
    return {
      ...entity
    };
  }

  return {
    ...draft
  };
};

class AutoSaveForm extends Component {
  state = {
    userChanges: {}
  };
  componentDidMount() {
    this.props.onFormReady(this.props.entityId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.entityId !== prevProps.entityId) {
      this.props.onFormReady(this.props.entityId);
      this.setState({ userChanges: {} });
    }
  }

  handleDescriptionChanged = e => {
    const value = e.target.value;
    this.setState(state => ({
      userChanges: {
        ...state.userChanges,
        description: value
      }
    }));
  };

  handleFormSubmit = e => {
    e.preventDefault();

    // TODO Read values from state instead of HTML form?
    // Since the form is controlled ...
    const formData = new FormData(e.target);
    const entries = Array.from(formData.entries());
    const data = entries.reduce((acc, value) => {
      acc[value[0]] = value[1];
      return acc;
    }, {});

    this.props.onSave({ ...data, id: this.props.entityId });
  };

  handleFormCancel = () => {
    this.props.onCancel();
  };

  render() {
    const { draft, entity, isLoading } = this.props;
    if (isLoading) {
      return <div>Loading ...</div>;
    }

    const initialFormValues = getInitialFormValues({
      draft: draft,
      entity: entity,
      defaultValues: {
        description: ""
      }
    });
    const formData = {
      ...initialFormValues,
      ...this.state.userChanges
    };

    return (
      <div>
        <form onSubmit={this.handleFormSubmit}>
          <input
            type="text"
            name="description"
            value={formData.description}
            onChange={this.handleDescriptionChanged}
          />
          <button onClick={this.handleFormCancel}>Cancel</button>
          <button type="submit">Save</button>
        </form>
      </div>
    );
  }
}

export default AutoSaveForm;
