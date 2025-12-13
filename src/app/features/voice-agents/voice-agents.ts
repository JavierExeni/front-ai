import {
  Component,
  OnInit,
  signal,
  inject,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { DividerModule } from 'primeng/divider';
import { DialogModule } from 'primeng/dialog';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

import { VoiceAgentsApi, CreateCampaignAgentRequest } from '../../core/services/voice-agents-api';
import { CampaignAgent } from '../../core/models/agent';
import { Auth } from '../../core/services/auth';
import { AgentVoiceForm } from './agent-voice-form/agent-voice-form';
import { PromptsApi, CreatePromptRequest } from '../../core/services/prompts-api';
import { Prompt } from '../../core/models/prompt';

@Component({
  selector: 'app-voice-agents',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, InputTextModule, DividerModule, DialogModule, TextareaModule, ConfirmDialogModule, AgentVoiceForm],
  templateUrl: './voice-agents.html',
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class VoiceAgents implements OnInit {
  private voiceAgentsApi = inject(VoiceAgentsApi);
  private promptsApi = inject(PromptsApi);
  private auth = inject(Auth);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);

  promptForm!: FormGroup;

  agents = signal<CampaignAgent[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  searchQuery = signal<string>('');
  activeTab = signal<'agents' | 'prompts'>('agents');

  agentVoiceFormVisible = signal<boolean>(false);
  isCreating = signal<boolean>(false);
  createError = signal<string | null>(null);
  isDeletingAgent = signal<boolean>(false);
  selectedAgent = signal<CampaignAgent | null>(null);

  // Prompts
  prompts = signal<Prompt[]>([]);
  isLoadingPrompts = signal<boolean>(false);
  promptsError = signal<string | null>(null);
  selectedPrompt = signal<Prompt | null>(null);
  promptFormVisible = signal<boolean>(false);
  isDeletingPrompt = signal<boolean>(false);

  // Filtered agents based on search query
  filteredAgents = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    if (!query) {
      return this.agents();
    }
    return this.agents().filter(
      (agent) =>
        agent.agent.name.toLowerCase().includes(query) || agent.name.toLowerCase().includes(query)
    );
  });

  // Agent form initial data for editing
  agentFormInitialData = computed(() => {
    const agent = this.selectedAgent();
    if (!agent) {
      return null;
    }
    return {
      name: agent.name,
      title: agent.agent_title,
      voiceId: agent.agent.id,
    };
  });

  ngOnInit(): void {
    this.initPromptForm();
    this.loadAgents();
    this.loadPrompts();
  }

  initPromptForm(): void {
    this.promptForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      prompt: ['', [Validators.required, Validators.minLength(10)]],
    });
  }

  loadAgents(): void {
    const currentUser = this.auth.currentUser();

    if (!currentUser?.company_id) {
      this.error.set('No company ID found. Please ensure you are logged in.');
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.error.set(null);

    this.voiceAgentsApi.getVoiceAgents(currentUser.company_id).subscribe({
      next: (agents) => {
        this.agents.set(agents);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load voice agents. Please try again later.');
        this.isLoading.set(false);
        console.error('Error loading voice agents:', err);
      },
    });
  }

  setActiveTab(tab: 'agents' | 'prompts'): void {
    this.activeTab.set(tab);
    if (tab === 'prompts') {
      this.loadPrompts();
    }
  }

  loadPrompts(): void {
    const currentUser = this.auth.currentUser();

    if (!currentUser?.company_id) {
      this.promptsError.set('No company ID found. Please ensure you are logged in.');
      this.isLoadingPrompts.set(false);
      return;
    }

    this.isLoadingPrompts.set(true);
    this.promptsError.set(null);

    this.promptsApi.getPrompts(currentUser.company_id, 'voice').subscribe({
      next: (prompts) => {
        this.prompts.set(prompts);
        this.isLoadingPrompts.set(false);
      },
      error: (err) => {
        this.promptsError.set('Failed to load prompts. Please try again later.');
        this.isLoadingPrompts.set(false);
        console.error('Error loading prompts:', err);
      },
    });
  }

  createPrompt(): void {
    this.selectedPrompt.set(null);
    this.promptForm.reset();
    this.promptFormVisible.set(true);
  }

  editPrompt(prompt: Prompt): void {
    this.selectedPrompt.set(prompt);
    this.promptForm.patchValue({
      name: prompt.name,
      prompt: prompt.prompt,
    });
    this.promptFormVisible.set(true);
  }

  deletePrompt(prompt: Prompt): void {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.isDeletingPrompt.set(true);

        this.promptsApi.deletePrompt(prompt.id).subscribe({
          next: () => {
            this.isDeletingPrompt.set(false);
            this.loadPrompts();
          },
          error: (err) => {
            this.isDeletingPrompt.set(false);
            console.error('Error deleting prompt:', err);
            alert('Failed to delete prompt. Please try again.');
          },
        });
      },
    });
  }

  onCancelPromptForm(): void {
    this.promptFormVisible.set(false);
    this.selectedPrompt.set(null);
    this.promptForm.reset();
  }

  onSubmitPromptForm(): void {
    if (!this.promptForm.valid) {
      this.promptForm.markAllAsTouched();
      return;
    }

    const currentUser = this.auth.currentUser();

    if (!currentUser?.company_id) {
      alert('No company ID found. Please ensure you are logged in.');
      return;
    }

    this.isCreating.set(true);

    const formValue = this.promptForm.value;
    const requestData: CreatePromptRequest = {
      agent_type: 'voice',
      name: formValue.name,
      prompt: formValue.prompt,
      company: currentUser.company_id.toString(),
    };

    const selectedPrompt = this.selectedPrompt();
    const request$ = selectedPrompt
      ? this.promptsApi.updatePrompt(selectedPrompt.id, requestData)
      : this.promptsApi.createPrompt(requestData);

    request$.subscribe({
      next: () => {
        this.isCreating.set(false);
        this.promptFormVisible.set(false);
        this.selectedPrompt.set(null);
        this.promptForm.reset();
        this.loadPrompts();
      },
      error: (err) => {
        this.isCreating.set(false);
        console.error(`Error ${selectedPrompt ? 'updating' : 'creating'} prompt:`, err);
        alert(`Failed to ${selectedPrompt ? 'update' : 'create'} prompt. Please try again.`);
      },
    });
  }

  get promptFormName() {
    return this.promptForm.get('name');
  }

  get promptFormPrompt() {
    return this.promptForm.get('prompt');
  }

  onSearchChange(value: string): void {
    this.searchQuery.set(value);
  }

  createVoiceAgent(): void {
    this.selectedAgent.set(null);
    this.agentVoiceFormVisible.set(true);
    this.createError.set(null);
  }

  editAgent(agent: CampaignAgent): void {
    this.selectedAgent.set(agent);
    this.agentVoiceFormVisible.set(true);
    this.createError.set(null);
  }

  onCancelCreate(): void {
    this.agentVoiceFormVisible.set(false);
    this.createError.set(null);
    this.isCreating.set(false);
    this.selectedAgent.set(null);
  }

  onSubmitCreate(data: { name: string; title: string; voiceId: number }): void {
    const currentUser = this.auth.currentUser();

    if (!currentUser?.company_id) {
      this.createError.set('No company ID found. Please ensure you are logged in.');
      return;
    }

    this.isCreating.set(true);
    this.createError.set(null);

    const requestData: CreateCampaignAgentRequest = {
      name: data.name,
      agent_title: data.title,
      agent: data.voiceId.toString(),
    };

    const selectedAgent = this.selectedAgent();
    const request$ = selectedAgent
      ? this.voiceAgentsApi.updateCampaignAgent(currentUser.company_id, selectedAgent.id, requestData)
      : this.voiceAgentsApi.createCampaignAgent(currentUser.company_id, requestData);

    request$.subscribe({
      next: () => {
        this.isCreating.set(false);
        this.agentVoiceFormVisible.set(false);
        this.selectedAgent.set(null);
        this.loadAgents();
      },
      error: (err) => {
        this.isCreating.set(false);
        console.error(`Error ${selectedAgent ? 'updating' : 'creating'} campaign agent:`, err);

        let errorMessage = `Failed to ${selectedAgent ? 'update' : 'create'} voice agent. Please try again.`;
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.detail) {
          errorMessage = err.error.detail;
        }

        this.createError.set(errorMessage);
      },
    });
  }

  viewAgentActivity(agent: CampaignAgent): void {
    // TODO: Implement view agent activity logic
    console.log('View activity for agent:', agent);
  }

  deleteAgent(agent: CampaignAgent): void {
    this.confirmationService.confirm({
      message: 'Do you want to delete this record?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      acceptButtonStyleClass: 'p-button-danger p-button-text',
      rejectButtonStyleClass: 'p-button-text p-button-text',
      acceptIcon: 'none',
      rejectIcon: 'none',
      acceptLabel: 'Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        const currentUser = this.auth.currentUser();

        if (!currentUser?.company_id) {
          alert('No company ID found. Please ensure you are logged in.');
          return;
        }

        this.isDeletingAgent.set(true);

        this.voiceAgentsApi.deleteCampaignAgent(currentUser.company_id, agent.id).subscribe({
          next: () => {
            this.isDeletingAgent.set(false);
            this.loadAgents();
          },
          error: (err) => {
            this.isDeletingAgent.set(false);
            console.error('Error deleting agent:', err);
            alert('Failed to delete agent. Please try again.');
          },
        });
      },
    });
  }
}
