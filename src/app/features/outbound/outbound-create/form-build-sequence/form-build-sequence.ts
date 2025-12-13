import { Component, inject, output, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TextareaModule } from 'primeng/textarea';
import { DialogModule } from 'primeng/dialog';
import { MessageModule } from 'primeng/message';
import { VoiceAgentsApi, CreateCampaignAgentRequest } from '../../../../core/services/voice-agents-api';
import { PromptsApi } from '../../../../core/services/prompts-api';
import { CampaignAgent } from '../../../../core/models/agent';
import { Prompt } from '../../../../core/models/prompt';
import { AgentVoiceForm } from '../../../voice-agents/agent-voice-form/agent-voice-form';
import { Auth } from '../../../../core/services/auth';

type AgentType = 'voice' | 'email' | 'sms';

interface ActionOption {
  label: string;
  value: AgentType;
}

interface DelayOption {
  label: string;
  value: string;
}

interface InteractionOption {
  label: string;
  value: string;
}

@Component({
  selector: 'form-build-sequence',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SelectModule,
    ButtonModule,
    TextareaModule,
    DialogModule,
    MessageModule,
    AgentVoiceForm,
  ],
  templateUrl: './form-build-sequence.html',
  styles: ``,
})
export class FormBuildSequence {
  private fb = inject(FormBuilder);
  private agentsApi = inject(VoiceAgentsApi);
  private promptsApi = inject(PromptsApi);
  private auth = inject(Auth);

  continue = output<void>();
  back = output<void>();

  actionOptions: ActionOption[] = [
    { label: 'Call Agent', value: 'voice' },
    { label: 'Email Agent', value: 'email' },
    { label: 'Text Agent', value: 'sms' },
  ];

  // Delay options for first sequence
  firstSequenceDelayOptions: DelayOption[] = [
    { label: 'Immediately', value: 'immediately' },
  ];

  // Delay options for subsequent sequences
  subsequentDelayOptions: DelayOption[] = [
    { label: 'Immediately', value: 'immediately' },
    { label: '1 hour', value: '1_hour' },
    { label: '3 hours', value: '3_hours' },
    { label: '5 hours', value: '5_hours' },
    { label: '1 day', value: '1_day' },
  ];

  // Interaction options by agent type
  voiceInteractionOptions: InteractionOption[] = [
    { label: 'Make a Call', value: 'make_call' },
    { label: 'Follow up Call', value: 'follow_up_call' },
  ];

  emailInteractionOptions: InteractionOption[] = [
    { label: 'Send Email', value: 'send_email' },
  ];

  smsInteractionOptions: InteractionOption[] = [
    { label: 'Send SMS', value: 'send_sms' },
  ];

  // Signals for dynamic data
  campaignAgents = signal<CampaignAgent[]>([]);
  prompts = signal<Prompt[]>([]);

  // Dialog signals
  agentDialogVisible = signal<boolean>(false);
  isCreatingAgent = signal<boolean>(false);
  createAgentError = signal<string | null>(null);
  currentAgentType = signal<AgentType | null>(null);

  sequencesForm = this.fb.group({
    sequences: this.fb.array([]),
  });

  get sequences(): FormArray {
    return this.sequencesForm.get('sequences') as FormArray;
  }

  constructor() {
    // Add first sequence by default
    this.addSequence();
  }

  createSequenceForm(isFirstSequence: boolean = false) {
    return this.fb.group({
      actionType: [null as AgentType | null, Validators.required],
      delay: [isFirstSequence ? 'immediately' : null, Validators.required],
      agentId: [null as number | null, Validators.required],
      interaction: ['', Validators.required],
      promptId: [null as number | string | null],
      customPrompt: [''],
    });
  }

  addSequence() {
    const isFirstSequence = this.sequences.length === 0;
    const sequenceIndex = this.sequences.length;
    const sequenceForm = this.createSequenceForm(isFirstSequence);

    // Subscribe to action type changes
    sequenceForm.get('actionType')?.valueChanges.subscribe((actionType) => {
      if (actionType) {
        this.loadAgentsAndPrompts(actionType, sequenceIndex);

        // Only set default interaction for first sequence
        if (sequenceIndex === 0) {
          if (actionType === 'voice') {
            sequenceForm.patchValue({ interaction: 'make_call' });
          } else if (actionType === 'email') {
            sequenceForm.patchValue({ interaction: 'send_email' });
          } else if (actionType === 'sms') {
            sequenceForm.patchValue({ interaction: 'send_sms' });
          }
        }
      }
    });

    // Subscribe to prompt ID changes to update custom prompt field
    sequenceForm.get('promptId')?.valueChanges.subscribe((promptId) => {
      if (promptId && promptId !== 'custom') {
        const selectedPrompt = this.prompts().find((p) => p.id === promptId);
        if (selectedPrompt) {
          sequenceForm.patchValue({ customPrompt: selectedPrompt.prompt });
        }
      } else if (promptId === 'custom') {
        sequenceForm.patchValue({ customPrompt: '' });
      }
    });

    this.sequences.push(sequenceForm);
  }

  loadAgentsAndPrompts(agentType: AgentType, sequenceIndex: number) {
    const currentUser = this.auth.currentUser();

    if (!currentUser?.company_id) {
      console.error('No company ID found');
      return;
    }

    // Load campaign agents
    this.agentsApi.getCampaignAgents(currentUser.company_id, agentType).subscribe({
      next: (agents) => {
        this.campaignAgents.set(agents);
      },
      error: (error) => {
        console.error('Error loading agents:', error);
      },
    });

    // Load prompts
    this.promptsApi.getPrompts(currentUser.company_id, agentType).subscribe({
      next: (prompts) => {
        this.prompts.set(prompts);
      },
      error: (error) => {
        console.error('Error loading prompts:', error);
      },
    });
  }

  // Get delay options based on sequence index
  getDelayOptions(sequenceIndex: number): DelayOption[] {
    return sequenceIndex === 0 ? this.firstSequenceDelayOptions : this.subsequentDelayOptions;
  }

  // Get interaction options based on agent type
  getInteractionOptions(actionType: AgentType | null): InteractionOption[] {
    if (actionType === 'voice') return this.voiceInteractionOptions;
    if (actionType === 'email') return this.emailInteractionOptions;
    if (actionType === 'sms') return this.smsInteractionOptions;
    return [];
  }

  // Check if interaction select should be disabled
  isInteractionDisabled(actionType: AgentType | null, sequenceIndex: number): boolean {
    // For first sequence, keep it disabled (auto-set to default)
    if (sequenceIndex === 0) return true;
    // For subsequent sequences, enable if action type is selected
    return !actionType;
  }

  getInteractionLabel(actionType: AgentType | null): string {
    if (actionType === 'voice') return 'Make a Call';
    if (actionType === 'email') return 'Send Email';
    if (actionType === 'sms') return 'Send SMS';
    return 'Select action';
  }

  deleteSequence(index: number) {
    if (this.sequences.length > 1) {
      this.sequences.removeAt(index);
    }
  }

  saveSequence(index: number) {
    const sequence = this.sequences.at(index);
    if (sequence.valid) {
      console.log('Saving sequence:', sequence.value);
      // TODO: Implement save logic
    }
  }

  onBack() {
    this.back.emit();
  }

  onContinue() {
    if (this.sequencesForm.valid) {
      console.log('All sequences:', this.sequences.value);
      this.continue.emit();
    }
  }

  // Get prompts with "Custom" option
  getPromptsWithCustom(): Array<{ label: string; value: number | string }> {
    const customOption = { label: 'Custom', value: 'custom' };
    const promptOptions = this.prompts().map((p) => ({
      label: p.name,
      value: p.id,
    }));
    return [customOption, ...promptOptions];
  }

  // Check if custom prompt is selected
  isCustomPromptSelected(index: number): boolean {
    const sequence = this.sequences.at(index);
    return sequence.get('promptId')?.value === 'custom';
  }

  // Open create agent dialog
  openCreateAgentDialog(agentType: AgentType) {
    this.currentAgentType.set(agentType);
    this.agentDialogVisible.set(true);
    this.createAgentError.set(null);
  }

  // Cancel agent creation
  onCancelAgentCreate() {
    this.agentDialogVisible.set(false);
    this.createAgentError.set(null);
    this.isCreatingAgent.set(false);
    this.currentAgentType.set(null);
  }

  // Submit agent creation
  onSubmitAgentCreate(data: { name: string; title: string; voiceId: number }) {
    const currentUser = this.auth.currentUser();

    if (!currentUser?.company_id) {
      this.createAgentError.set('No company ID found. Please ensure you are logged in.');
      return;
    }

    this.isCreatingAgent.set(true);
    this.createAgentError.set(null);

    const requestData: CreateCampaignAgentRequest = {
      name: data.name,
      agent_title: data.title,
      agent: data.voiceId.toString(),
    };

    this.agentsApi.createCampaignAgent(currentUser.company_id, requestData).subscribe({
      next: () => {
        // Save agent type before clearing
        const agentType = this.currentAgentType();

        this.isCreatingAgent.set(false);
        this.agentDialogVisible.set(false);
        this.currentAgentType.set(null);

        // Reload agents based on saved agent type
        if (agentType) {
          this.loadAgentsAndPrompts(agentType, 0);
        }
      },
      error: (err) => {
        this.isCreatingAgent.set(false);
        console.error('Error creating campaign agent:', err);

        let errorMessage = 'Failed to create voice agent. Please try again.';
        if (err.error?.message) {
          errorMessage = err.error.message;
        } else if (err.error?.detail) {
          errorMessage = err.error.detail;
        }

        this.createAgentError.set(errorMessage);
      },
    });
  }

  // Get dialog header based on agent type
  getAgentDialogHeader(): string {
    const agentType = this.currentAgentType();
    if (agentType === 'voice') return 'Create Voice Agent';
    if (agentType === 'email') return 'Create Email Agent';
    if (agentType === 'sms') return 'Create Text Agent';
    return 'Create Agent';
  }
}
