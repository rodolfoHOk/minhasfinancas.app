import React from 'react';
import { withRouter } from 'react-router-dom';

import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';

import Card from '../../components/card';
import FormGroup from '../../components/form-group';
import SelectMenu from '../../components/selectMenu';

import LancamentosTable from './lancamentosTable';
import LancamentoService from '../../app/service/lancamentoService';
// import LocalStorageService from '../../app/service/localStorageService'; JWT

import { AuthContext } from '../../main/provedorAutenticacao'; // JWT

import * as messages from '../../components/toastr';

class ConsultaLancamentos extends React.Component {
  constructor(props) {
    super(props);
    this.service = new LancamentoService();
    this.state = {
      ano: '',
      mes: '',
      tipo: '',
      status: '',
      descricao: '',
      showConfirmDialog: false,
      lancamentoADeletar: {},
      lancamentos: [],
    };
  }

  // eslint-disable-next-line consistent-return
  buscar = () => {
    const { ano } = this.state;
    const { mes } = this.state;
    const { tipo } = this.state;
    const { status } = this.state;
    const { descricao } = this.state;

    const { usuarioAutenticado } = this.context; // JWT
    // eslint-disable-next-line max-len
    // const usuarioLogado = LocalStorageService.obterItem('_usuario_logado'); JWT: provedorAutenticacao.

    const lancamentoFiltro = {
      ano,
      mes,
      tipo,
      status,
      descricao,
      usuario: usuarioAutenticado.id, // JWT mudamos de usuarioLogado.
    };

    if (!ano) {
      messages.mensagemErro('Campo ano é obrigatório');
      return false;
    }

    this.service.consultar(lancamentoFiltro)
      .then((resposta) => {
        const lista = resposta.data;
        if (lista < 1) {
          messages.mensagemAlerta('Nenhum resultado encontado!');
        }
        this.setState({ lancamentos: lista });
      }).catch((error) => {
        messages.mensagemErro(error.response.data);
      });
  }

  editar = (id) => {
    // eslint-disable-next-line react/prop-types
    const { history } = this.props;
    // eslint-disable-next-line react/prop-types
    history.push(`/cadastro-lancamentos/${id}`);
    // console.log('editando lancamento...', id);
  }

  abrirConfirmacao = (lancamento) => {
    this.setState({ showConfirmDialog: true, lancamentoADeletar: lancamento });
  }

  cancelarDelecao = () => {
    this.setState({ showConfirmDialog: false, lancamentoADeletar: {} });
  }

  deletar = () => {
    const { lancamentoADeletar } = this.state;
    this.service
      .deletar(lancamentoADeletar.id)
      .then(() => {
        const { lancamentos } = this.state;
        const index = lancamentos.indexOf(lancamentoADeletar);
        lancamentos.splice(index, 1);
        this.setState({ lancamentos, showConfirmDialog: false });
        messages.mensagemSucesso('Lançamento deletado');
      })
      .catch(() => {
        messages.mensagemErro('Ocorreu um erro ao tentar deletar o lançamento');
      });
    // console.log('deletando lancamento...', id);
  }

  preparaFormularioCadastro = () => {
    // eslint-disable-next-line react/prop-types
    const { history } = this.props;
    // eslint-disable-next-line react/prop-types
    history.push('/cadastro-lancamentos');
  }

  alterarStatus = (lancamento, status) => {
    this.service
      .alterarStatus(lancamento.id, status)
      .then(() => {
        const { lancamentos } = this.state;
        const index = lancamentos.indexOf(lancamento);
        if (index !== -1) {
          // eslint-disable-next-line no-param-reassign
          lancamento.status = status;
          lancamentos[index] = lancamento;
          this.setState(lancamentos);
        }
        messages.mensagemSucesso(`Status atualizado para ${status} com sucesso.`);
      })
      .catch((error) => {
        messages.mensagemErro(error.response.data);
      });
  }

  renderFooter() {
    return (
      <div>
        <Button
          label="Cancelar"
          icon="pi pi-times"
          onClick={this.cancelarDelecao}
          className="p-button-text"
        />
        <span> </span>
        <Button
          label="Confirmar"
          icon="pi pi-check"
          onClick={this.deletar}
          autoFocus
        />
      </div>
    );
  }

  render() {
    const { ano } = this.state;
    const { mes } = this.state;
    const { tipo } = this.state;
    const { status } = this.state;
    const { descricao } = this.state;
    const { lancamentos } = this.state;

    const { showConfirmDialog } = this.state;

    const listaMeses = this.service.obterListaMeses();
    const listaTipos = this.service.obterListaTipos();
    const listaStatus = this.service.obterListaStatus();

    /* somente para testar o front end
    const lancamentosTeste = [
      {
        id: 1, descricao: 'Salário', valor: 5000, tipo: 'RECEITA', mes: 1, status: 'EFETIVADO',
      },
      {
        id: 2, descricao: 'Fatura cartão', valor: 250, tipo: 'DESPESA', mes: 1, status: 'PENDENTE',
      },
    ];
    */

    return (
      <>
        <Card title="Consulta Lançamento">
          <div className="row">
            <div className="col-lg-6">
              <div className="bs-component">
                <fieldset>

                  <FormGroup label="Ano: *" htmlfor="inputAno">
                    <input
                      type="text"
                      className="form-control"
                      id="inputAno"
                      placeholder="Digite o Ano"
                      value={ano}
                      onChange={(e) => this.setState({ ano: e.target.value })}
                    />
                  </FormGroup>

                </fieldset>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="bs-component">
                <fieldset>

                  <FormGroup label="Mês: " htmlfor="inputMes">
                    <SelectMenu
                      className="form-control"
                      id="inputMes"
                      lista={listaMeses}
                      value={mes}
                      onChange={(e) => this.setState({ mes: e.target.value })}
                    />
                  </FormGroup>

                </fieldset>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="bs-component">
                <fieldset>

                  <FormGroup label="Descrição: " htmlfor="inputDescricao">
                    <input
                      type="text"
                      className="form-control"
                      id="inputDescricao"
                      placeholder="Digite a descrição"
                      value={descricao}
                      onChange={(e) => this.setState({ descricao: e.target.value })}
                    />
                  </FormGroup>

                </fieldset>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-6">
              <div className="bs-component">
                <fieldset>

                  <FormGroup label="Tipo Lançamento: " htmlfor="inputTipo">
                    <SelectMenu
                      className="form-control"
                      id="inputTipo"
                      lista={listaTipos}
                      value={tipo}
                      onChange={(e) => this.setState({ tipo: e.target.value })}
                    />
                  </FormGroup>

                </fieldset>
              </div>
            </div>

            <div className="col-lg-6">
              <div className="bs-component">
                <fieldset>

                  <FormGroup label="Status Lançamento: " htmlfor="inputStatus">
                    <SelectMenu
                      className="form-control"
                      id="inputStatus"
                      lista={listaStatus}
                      value={status}
                      onChange={(e) => this.setState({ status: e.target.value })}
                    />
                  </FormGroup>

                </fieldset>
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-lg-12">
              <div className="bs-component">
                <fieldset>

                  <button
                    type="button"
                    className="btn btn-success"
                    onClick={this.buscar}
                  >
                    <i className="pi pi-search" />
                    {' '}
                    Buscar
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={this.preparaFormularioCadastro}
                  >
                    <i className="pi pi-plus" />
                    {' '}
                    Cadastrar
                  </button>

                </fieldset>
              </div>
            </div>
          </div>
        </Card>
        <br />
        <div>
          <div className="row">
            <div className="col-lg-12">
              <div className="bs-component">

                <LancamentosTable
                  lancamentos={lancamentos}
                  editeAction={this.editar}
                  deleteAction={this.abrirConfirmacao}
                  alterarStatusAction={this.alterarStatus}
                />

              </div>
            </div>
          </div>
        </div>
        <div>
          <Dialog
            header="Confirmação"
            visible={showConfirmDialog}
            style={{ width: '50vw' }}
            // eslint-disable-next-line react/jsx-boolean-value
            modal={true}
            footer={this.renderFooter()}
            onHide={() => this.setState({ showConfirmDialog: false })}
          >
            <p>
              Confirma a exclusão deste lançamento?
            </p>
          </Dialog>
        </div>
      </>
    );
  }
}

ConsultaLancamentos.contextType = AuthContext; // JWT

export default withRouter(ConsultaLancamentos);
