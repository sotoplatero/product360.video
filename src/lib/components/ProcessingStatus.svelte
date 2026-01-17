<script>
	/**
	 * @typedef {'pending' | 'active' | 'completed' | 'error'} StepStatus
	 * @typedef {{ name: string, status: StepStatus, message?: string }} Step
	 */

	/** @type {{ steps: Step[], currentStep?: string }} */
	let { steps, currentStep } = $props();

	/**
	 * @param {StepStatus} status
	 */
	function getStatusIcon(status) {
		switch (status) {
			case 'completed':
				return 'check';
			case 'active':
				return 'spinner';
			case 'error':
				return 'x';
			default:
				return 'circle';
		}
	}

	/**
	 * @param {StepStatus} status
	 */
	function getStatusColor(status) {
		switch (status) {
			case 'completed':
				return 'text-green-500';
			case 'active':
				return 'text-blue-500';
			case 'error':
				return 'text-red-500';
			default:
				return 'text-gray-300';
		}
	}
</script>

<div class="w-full max-w-lg mx-auto">
	<div class="space-y-4">
		{#each steps as step, i (step.name)}
			{@const isLast = i === steps.length - 1}
			<div class="flex items-start gap-4">
				<div class="flex flex-col items-center">
					<div class="flex items-center justify-center w-8 h-8 rounded-full {getStatusColor(step.status)} bg-current/10">
						{#if step.status === 'completed'}
							<svg class="w-5 h-5 {getStatusColor(step.status)}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
							</svg>
						{:else if step.status === 'active'}
							<svg class="w-5 h-5 animate-spin {getStatusColor(step.status)}" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
						{:else if step.status === 'error'}
							<svg class="w-5 h-5 {getStatusColor(step.status)}" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						{:else}
							<div class="w-3 h-3 rounded-full bg-current opacity-50"></div>
						{/if}
					</div>
					{#if !isLast}
						<div class="w-0.5 h-8 {step.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'}"></div>
					{/if}
				</div>

				<div class="flex-1 pb-4">
					<h3 class="font-medium {step.status === 'pending' ? 'text-gray-400' : 'text-gray-900'}">
						{step.name}
					</h3>
					{#if step.message}
						<p class="text-sm {step.status === 'error' ? 'text-red-600' : 'text-gray-500'} mt-1">
							{step.message}
						</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
