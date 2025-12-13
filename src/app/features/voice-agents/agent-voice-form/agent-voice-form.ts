import {
  Component,
  OnInit,
  signal,
  inject,
  ChangeDetectionStrategy,
  output,
  input,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';

import { VoiceAgentsApi } from '../../../core/services/voice-agents-api';
import { VoiceAgent } from '../../../core/models/agent';

@Component({
  selector: 'agent-voice-form',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CarouselModule,
  ],
  templateUrl: './agent-voice-form.html',
  styleUrls: ['./agent-voice-form.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AgentVoiceForm implements OnInit {
  private fb = inject(FormBuilder);
  private voiceAgentsApi = inject(VoiceAgentsApi);

  // Inputs
  initialData = input<{ name: string; title: string; voiceId: number } | null>(null);

  // Outputs
  cancel = output<void>();
  submit = output<{ name: string; title: string; voiceId: number }>();

  // Form
  agentForm!: FormGroup;

  // Voices data
  voices = signal<VoiceAgent[]>([]);
  selectedVoice = signal<VoiceAgent | null>(null);
  isLoadingVoices = signal<boolean>(true);
  voicesError = signal<string | null>(null);

  // Audio player
  currentAudio: HTMLAudioElement | null = null;
  playingVoiceId = signal<number | null>(null);
  hoveredVoiceId = signal<number | null>(null);

  // Carousel settings
  carouselResponsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 4,
      numScroll: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '560px',
      numVisible: 2,
      numScroll: 1,
    },
  ];

  constructor() {
    // Effect to populate form when initialData changes
    effect(() => {
      const data = this.initialData();
      if (data && this.agentForm) {
        this.agentForm.patchValue({
          name: data.name,
          title: data.title,
        });

        // Find and select the voice
        const voice = this.voices().find((v) => v.id === data.voiceId);
        if (voice) {
          this.selectedVoice.set(voice);
        }
      }
    });
  }

  ngOnInit(): void {
    this.initForm();
    this.loadVoices();
  }

  initForm(): void {
    this.agentForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      title: ['', [Validators.required, Validators.minLength(2)]],
    });
  }

  loadVoices(): void {
    this.isLoadingVoices.set(true);
    this.voicesError.set(null);

    this.voiceAgentsApi.getAvailableVoices().subscribe({
      next: (voices) => {
        this.voices.set(voices);
        this.isLoadingVoices.set(false);
      },
      error: (err) => {
        this.voicesError.set('Failed to load voices. Please try again.');
        this.isLoadingVoices.set(false);
        console.error('Error loading voices:', err);
      },
    });
  }

  selectVoice(voice: VoiceAgent): void {
    this.selectedVoice.set(voice);
  }

  playVoice(voice: VoiceAgent, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    // If clicking the same voice that's playing, pause it
    if (this.playingVoiceId() === voice.id && this.currentAudio) {
      this.pauseAudio();
      return;
    }

    // Stop any currently playing audio
    this.pauseAudio();

    // Create and play new audio
    this.currentAudio = new Audio(voice.audio_url);
    this.playingVoiceId.set(voice.id);

    this.currentAudio.play().catch((error) => {
      console.error('Error playing audio:', error);
      this.playingVoiceId.set(null);
    });

    // Reset playing state when audio ends
    this.currentAudio.onended = () => {
      this.playingVoiceId.set(null);
      this.currentAudio = null;
    };
  }

  pauseAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }
    this.playingVoiceId.set(null);
  }

  setHoveredVoice(voiceId: number | null): void {
    this.hoveredVoiceId.set(voiceId);
  }

  isVoicePlaying(voiceId: number): boolean {
    return this.playingVoiceId() === voiceId;
  }

  isVoiceHovered(voiceId: number): boolean {
    return this.hoveredVoiceId() === voiceId;
  }

  isVoiceSelected(voiceId: number): boolean {
    return this.selectedVoice()?.id === voiceId;
  }

  onCancel(): void {
    this.pauseAudio();
    this.agentForm.reset();
    this.selectedVoice.set(null);
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.agentForm.valid && this.selectedVoice()) {
      const formValue = this.agentForm.value;
      this.submit.emit({
        name: formValue.name,
        title: formValue.title,
        voiceId: this.selectedVoice()!.id,
      });
      this.pauseAudio();
      this.agentForm.reset();
      this.selectedVoice.set(null);
    }
  }

  // Getters for form controls
  get nameControl() {
    return this.agentForm.get('name');
  }

  get titleControl() {
    return this.agentForm.get('title');
  }

  get isFormValid(): boolean {
    return this.agentForm.valid && this.selectedVoice() !== null;
  }
}
